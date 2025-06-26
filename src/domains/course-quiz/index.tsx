import { Progress } from "@radix-ui/react-progress";
import { RadioGroup, RadioGroupItem } from "@radix-ui/react-radio-group";
import { Separator } from "@radix-ui/react-separator";
import { BookOpenCheckIcon, HelpCircleIcon } from "lucide-react";
import { Button, Card, CardContent, Input } from "ti-react-template/components";

const quizOptions = [
  { id: "A", value: "$20.00" },
  { id: "B", value: "$40.00" },
  { id: "C", value: "$80.00" },
  { id: "D", value: "It depends on the number of vehicles" },
];

export const CourseQuiz = (): JSX.Element => {
  return (
    <div className="bg-[#f1f1f1] flex flex-row justify-center w-full min-h-screen">
      <div className="bg-[#f1f1f1] w-full max-w-[1920px] relative p-7">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-black">16 Apr 2024, Tuesday</div>
          <div className="w-80">
            <Input className="w-full" placeholder="search" />
            {/* icon={<SearchCheckIcon className="w-5 h-5" />} */}
          </div>
        </div>

        {/* Breadcrumb */}
        {/* <Breadcrumb className="mb-6">
          <BreadcrumbItem>
            <BreadcrumbLink href="/" className="text-gray-200">
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink className="font-semibold">
              All Courses
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb> */}

        {/* Main Content */}
        <div className="max-w-[1065px]">
          {/* Course Title */}
          <div className="flex items-center gap-2.5 mb-4">
            <img
              className="w-6 h-6"
              alt="Book open check"
              src="https://c.animaapp.com/9MHOVCpl/img/book-open-check.svg"
            />
            <h1 className="text-xl font-semibold">
              Beginner&apos;s Guide Practical Insights for Real-World
              Application.
            </h1>
          </div>

          {/* Quiz Card */}
          <Card className="mb-4">
            <CardContent className="p-6">
              {/* Toggle Buttons */}
              <div className="flex justify-end gap-2.5 mb-6">
                <Button variant="secondary" className="gap-2">
                  <BookOpenCheckIcon className="w-5 h-5" />
                  Read
                </Button>
                <Button variant="outline" className="gap-2">
                  <HelpCircleIcon className="w-5 h-5" />
                  Quiz
                </Button>
              </div>

              {/* Quiz Header */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-[#131336] rounded-full flex items-center justify-center text-white text-xs">
                    1
                  </div>
                  <h2 className="text-xl font-semibold">Quiz</h2>
                </div>
                <span className="text-sm font-medium">Question: 1/10</span>
              </div>

              <Separator className="mb-4" />

              {/* Question */}
              <p className="text-sm font-semibold mb-6">
                What is the minimum rebill amount for an online EZ TAG account
                based on the number of vehicles added
              </p>

              {/* Options */}
              <RadioGroup className="space-y-4">
                {quizOptions.map((option) => (
                  <div
                    key={option.id}
                    className="flex items-center space-x-4 p-2 border-b"
                  >
                    <span className="text-xl font-bold text-gray-200">
                      {option.id}
                    </span>
                    <RadioGroupItem value={option.id} id={option.id} />
                    <label htmlFor={option.id} className="text-sm font-medium">
                      {option.value}
                    </label>
                  </div>
                ))}
              </RadioGroup>

              {/* Action Buttons */}
              <div className="flex gap-2.5 mt-6">
                <Button>Submit</Button>
                <Button variant="secondary">Skip</Button>
              </div>
            </CardContent>
          </Card>

          {/* Progress Bar */}
          <Card>
            <CardContent className="p-3">
              <div className="text-sm font-semibold mb-2.5">Module 1</div>
              <Progress value={73} className="h-2.5" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
