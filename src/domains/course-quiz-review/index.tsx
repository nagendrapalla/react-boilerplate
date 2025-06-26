import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Separator,
} from "ti-react-template/components";

// Quiz question data
const quizQuestions = [
  {
    id: 1,
    question:
      "What is the minimum rebill amount for an online EZ TAG account based on the number of vehicles added",
    options: [
      { id: "A", value: "$20.00", isCorrect: false },
      { id: "B", value: "$40.00", isCorrect: false },
      { id: "C", value: "$80.00", isCorrect: false, isSelected: true },
      {
        id: "D",
        value: "It depends on the number of vehicles",
        isCorrect: true,
      },
    ],
    reason:
      "The context states that the minimum rebill amount for an online EZ TAG account depends on the number of vehicles added.",
  },
  {
    id: 2,
    question:
      "What is the minimum rebill amount for an online EZ TAG account based on the number of vehicles added",
    options: [
      { id: "A", value: "$20.00", isCorrect: false },
      { id: "B", value: "$40.00", isCorrect: false },
      { id: "C", value: "$80.00", isCorrect: false },
      {
        id: "D",
        value: "It depends on the number of vehicles",
        isCorrect: true,
      },
    ],
  },
  {
    id: 3,
    question:
      "What is the minimum rebill amount for an online EZ TAG account based on the number of vehicles added",
    options: [
      { id: "A", value: "$20.00", isCorrect: false },
      { id: "B", value: "$40.00", isCorrect: false },
      { id: "C", value: "$80.00", isCorrect: false, isSelected: true },
      {
        id: "D",
        value: "It depends on the number of vehicles",
        isCorrect: true,
      },
    ],
  },
];

const getOptionTextColorClass = (option: {
  isSelected: boolean;
  isCorrect: boolean;
}): string => {
  if (option.isSelected && !option.isCorrect) return "text-red-300";
  if (option.isCorrect) return "text-[#00bd35]";
  return "text-gray-200";
};

const getOptionClassName = (option: {
  isSelected: boolean;
  isCorrect: boolean;
}): string => {
  return `text-xl font-bold ${getOptionTextColorClass(option)}`;
};

export const CourseQuizReview = (): JSX.Element => {
  return (
    <div className="bg-[#f1f1f1] min-h-screen">
      <div className="mx-auto relative">
        {/* Main Content */}
        <main>
          <Card className="p-5 bg-primary-color-gray-10">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">
                Quiz Review
              </CardTitle>
              <Separator className="mt-2" />
            </CardHeader>
            <CardContent>
              {quizQuestions.map((question) => (
                <div key={question.id} className="mb-8">
                  <div className="flex gap-4 mb-4">
                    <div className="w-6 h-6 flex items-center justify-center bg-[#131336] rounded-full">
                      <span className="text-white text-xs font-medium">
                        {question.id}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold">
                      {question.question}
                    </h3>
                  </div>

                  <Card className="mb-4">
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        {question.options.map((option) => (
                          <div
                            key={option.id}
                            className="flex items-center gap-8 py-2 border-b last:border-b-0"
                          >
                            <div
                              className={getOptionClassName({
                                ...option,
                                isSelected: option.isSelected ?? false,
                              })}
                            >
                              {option.id}
                            </div>
                            <div
                              className={`text-sm font-medium ${getOptionTextColorClass(
                                {
                                  ...option,
                                  isSelected: option.isSelected ?? false,
                                }
                              )}`}
                            >
                              {option.value}
                            </div>
                          </div>
                        ))}
                      </div>

                      {question.reason && (
                        <div className="mt-4 bg-gray-0 p-4 rounded-b-[5px]">
                          <span className="font-bold">Explanation:</span>{" "}
                          {question.reason}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {question.options.some(
                    (opt) => opt.isSelected && !opt.isCorrect
                  ) && (
                    <Button
                      variant="outline"
                      className="ml-24 text-sm font-medium"
                    >
                      Explain Why
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};
