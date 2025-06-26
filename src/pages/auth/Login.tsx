import React, { useState } from 'react';
import { useOtpLogin } from '../../hooks/useOtpLogin';
import Input from '../../components/Input';
import Button from '../../components/Button';

const Login: React.FC = () => {
  const [phone, setPhone] = useState('');
  const { requestOtp, verifyOtp } = useOtpLogin();
  const [otp, setOtp] = useState('');
  const [stage, setStage] = useState<'request' | 'verify'>('request');

  const handleRequest = async () => {
    await requestOtp(phone);
    setStage('verify');
  };

  const handleVerify = async () => {
    await verifyOtp({ phone, otp });
  };

  return (
    <div>
      {stage === 'request' ? (
        <div>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Button onClick={handleRequest}>Send OTP</Button>
        </div>
      ) : (
        <div>
          <Input value={otp} onChange={(e) => setOtp(e.target.value)} />
          <Button onClick={handleVerify}>Verify OTP</Button>
        </div>
      )}
    </div>
  );
};

export default Login;
