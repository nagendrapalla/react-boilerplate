import { BackButton } from '../back-button';
// import moment from 'moment';
import { cn } from '@/shared/utlis/cn';

interface PageHeaderProps {
  className?: string;
}

export const PageHeader = ({ className }: PageHeaderProps) => {
  return (
    <div className={cn("flex justify-between items-center", className)}>
      <BackButton />
      {/* <div className="text-sm text-black mb-2">{moment().format('DD MMM YYYY, dddd')}</div> */}
    </div>
  );
};
