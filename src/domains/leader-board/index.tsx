import { getAxios } from "@/shared/api/apiClient";
import {   useUserName } from "@/domains/auth/store/authAtom";
import { useSuspenseQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  BookOpenCheck,
  ClipboardCheck,
  Eye,
  Percent,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  TableHead,
} from "ti-react-template/components";
import { z } from "zod";
import { getItem } from "@/shared/utlis/localStorage";

const leaderboardSchema = z.array(z.object({
  traineeName: z.string(),
  cohortName: z.string().nullable(),
  rank: z.number(),
  totalScore: z.string(),
  percentage: z.string().nullable(),
  completed: z.string()
}))

const ProgressSchema = z.object({
  traineeName: z.string().nullable(),
  cohortName: z.string().nullable(),
  rank: z.number(),
  totalQuizAttempted: z.number(),
  totalScore: z.string(),
  percentage: z.string().nullable(),
  completed: z.string(),
})

type Progress=z.infer<typeof ProgressSchema>


type leaderboardData = z.infer<typeof leaderboardSchema>

async function fetchLeaderboard(): Promise<leaderboardData> {
  const response = await getAxios("/api/v0/trainee/leaderboard");
  const data = leaderboardSchema.parse(response.data);
  return data;
}

async function fetchProgress(userId: string):Promise<Progress>{
  const response = await getAxios(`/api/v0/user/${userId}/scoreboard`);
  return ProgressSchema.parse(response.data);
}


export default function LeaderBoard(): JSX.Element {
  const name = useUserName();
  const userId=getItem("userId") as string

  const { data: progress } = useSuspenseQuery({
    queryKey: ["progress"],
    queryFn: () => fetchProgress(userId),
   
  });

  const { data: leaderBoard } = useSuspenseQuery({
    queryKey: ["leaderboard"],
    queryFn: fetchLeaderboard,
   
  });

  if (!leaderBoard) {
    throw new Error("Leaderboard data not found");
  }

  if (!progress) {
    throw new Error("Progress not found");
  }



  const statsData = [
    { 
      icon: <Eye className="h-6 w-6" />, 
      label: "Completed Topics", 
      value: progress.completed 
    },
    {
      icon: <ClipboardCheck className="h-6 w-6" />,
      label: "Quiz Score",
      value: progress.totalScore,
    },
    { 
      icon: <Percent className="h-6 w-6" />, 
      label: "Quiz Completion", 
      value: progress.percentage, 
    },
  ];

  return (
    <div className="min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex">
          <main className="flex-1 p-6">
            <div className="flex justify-between items-center mb-8">
        
            </div>

            <div className="flex items-center gap-2 mb-4">
              <BookOpenCheck className="w-6 h-6" />
              <h1 className="text-xl font-semibold">Leaderboard</h1>
            </div>

            <Card className="mb-8 bg-gradient-to-b from-[#47546A] to-[#677184]">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  {statsData.map((stat) => (
                    <div key={stat.label} className="flex items-center gap-4">
                      <div className="bg-gray-50 p-2 rounded-md">{stat.icon}</div>
                      <div className="text-white">
                        <div className="text-sm">{stat.label}</div>
                        <div className="text-lg font-semibold">{stat.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16 text-center">Rank</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead className="text-right">Percentage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaderBoard.map((user) => (
                      <TableRow
                        key={user.rank}
                        className={`
                          ${user.rank % 2 === 0 ? "bg-blue-gray-50" : "bg-blue-gray-100"}
                          ${user.traineeName === name ? "bg-blue-100" : ""}
                        `}
                      >
                        <TableCell className="w-16 text-center font-bold">
                          {user.rank}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-4">
                            <span className="font-semibold">
                              {user.traineeName}
                              {user.traineeName === name && " (You)"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="w-5 h-5 inline">{user.percentage}%</div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </main>
        </div>
      </motion.div>
    </div>
  );
}
