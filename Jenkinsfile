pipeline {
    agent any

    options {
        ansiColor('xterm')
    }

    tools {
      maven 'maven-3.9.9'
    }

    environment {
        SONAR_URL = credentials('SONAR_URL')
        SONAR_LOGIN = credentials('SONAR_LOGIN')
        SONAR_PROJECT_NAME = 'csr-training-client'
        SONAR_PROJECT_KEY = 'csr-training-client'

        NODE_HOME = '/var/lib/jenkins/.nvm/versions/node/v18.20.5'
        NPM_HOME = '$NODE_HOME'
        PATH = "$NODE_HOME/bin:$PATH"

        NEXUS_URL = credentials('NEXUS_URL')
    }

    stages {

        stage('Node Version Check') {
            steps{
                sh '''
                    node -v
                    npm -v
                    yarn -v
                '''
            }
        }        

        stage('Install Dependencies') {
            steps{
                sh'''
                    npm install
                '''
            }
        }

        stage('Formatting Check') {
            steps{
                sh '''
                    npx prettier --check .
                '''
            }
        }

        stage('ESLint Check') {
            steps{
                sh '''
                    npx eslint .
                '''
            }
        }

        stage('Code Coverage') {
            steps{
                sh '''
                    npm run coverage
                '''
            }
        }                         

        stage('Build') {
            steps{
                script{
                    sh'''
                        mvn clean install -f pom.xml -Dmaven.test.skip
                    '''
                }
            }
        }         

        stage('Sonar Scanning') {
            steps{
                sh'''
                    npx sonar-scanner -Dsonar.host.url=${SONAR_URL} -Dsonar.login=${SONAR_LOGIN} -Dsonar.projectName=${SONAR_PROJECT_NAME} -Dsonar.sources=. -Dsonar.projectKey=${SONAR_PROJECT_KEY}
                '''
            }
        }

        stage('Uploading Artifact to cicd/jenkins-integration branch') {
            when {
                branch 'cicd/jenkins-integration'
            }
            steps {
                nexusArtifactUploader(
                    nexusVersion: 'nexus3',
                    protocol: 'http',
                    nexusUrl: "${env.NEXUS_URL}",
                    groupId: 'com.hctra',
                    version: "${BUILD_NUMBER}",
                    repository: 'csr-training-client-test',
                    credentialsId: 'NEXUS_AUTH', //Configure inside manage credentials section
                    artifacts: [
                        [artifactId: 'training',
                        classifier: '',
                        file: '/var/lib/jenkins/workspace/_client_cicd_jenkins-integration/target/training.war',
                        type: 'war']
                    ]
                )
            }
        }        

        stage('Uploading Artifact to develop branch') {
            when {
                branch 'develop'
            }
            steps {
                nexusArtifactUploader(
                    nexusVersion: 'nexus3',
                    protocol: 'http',
                    nexusUrl: "${env.NEXUS_URL}",
                    groupId: 'com.hctra',
                    version: "${BUILD_NUMBER}",
                    repository: 'csr-training-client',
                    credentialsId: 'NEXUS_AUTH', //Configure inside manage credentials section
                    artifacts: [
                        [artifactId: 'training',
                        classifier: '',
                        file: '/var/lib/jenkins/workspace/csr-training-client_develop/target/training.war',
                        type: 'war']
                    ]
                )
            }
        }        

        stage('Deploy') {
            steps{
                sh'''
                    echo "Deploying the Application"
                '''
            }
        }
    }

    post {
        success {
            echo "Pipeline is Success"
        }
        failure {
            echo "Pipeline is Failed"
        }
    }    
}
