import { Award, BookCheck, MailCheckIcon } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Separator,
  ScrollArea
} from "ti-react-template/components";
import moment from "moment";

type UserProfileProps = {


  initialData: {

    badges: Array<{
      id: number;
      title: string;
      earnedDate: string;
      icon: string;
      badgeType: string;
    }>;
    feedbacks: Array<{
      date: string;
      content: string;
      givenBy: string;
    }>;
    name: string;
    userName: string;
  };
};

export const UserProfile = ({ initialData }: UserProfileProps): JSX.Element => {

  // Ensure we have arrays even if initialData is undefined
  const displayBadges = initialData?.badges ?? [];
  const displayFeedbacks = initialData?.feedbacks ?? [];

  return (
    <div className="bg-neutral-100 min-h-screen">
      <div className="max-w-[1920px] mx-auto relative">
        {/* Main Content */}
        <main className="p-5">
          {/* User Info Card */}
          <Card className="mb-6 bg-[#E7E7E7]">
            <CardContent className="flex items-center gap-4 py-4">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src="https://c.animaapp.com/z2ODMQVf/img/ellipse@2x.png"
                  alt="User"
                />
                <AvatarFallback>DP</AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-4">
                <span className="text-base font-semibold">{initialData.name}</span>
                <div className="flex items-center gap-1">
                  <MailCheckIcon className="h-4 w-4" />
                  <span className="text-xs">{initialData.userName}</span>
                </div>

              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-[1fr_2fr] gap-6">
            {/* Badges Section */}
            <div className="space-y-6">
              {/* Course Badges */}
              <Card>
                <CardHeader>
                  <CardTitle>Course Completion Badges</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2.5 p-4 bg-[#F5F5F5] rounded-[5px] ">
                    {displayBadges.filter(badge=>badge.badgeType === "Course").length > 0 ?
                    displayBadges.filter(badge=>badge.badgeType === "Course").map((badge) => (
                      

                        <div
                        key={badge.id}
                        className="flex items-center gap-2.5 p-4 bg-[#F5F5F5] rounded-[5px]"
                        >
                        {/* <img src={badge.icon} alt="Badge" className="w-8 h-8" /> */}
                        <div className=" bg-emerald-900 rounded-full p-2 shadow-sm hover:scale-110 transition-transform duration-200">
                        <Award className="w-7 h-7 text-emerald-100" />
                        </div>
                        <div>
                        <div className="font-semibold">{badge.title}</div>
                        <div className="text-sm text-gray-4">
                        <span className="font-bold">Earned on:</span>{" "}
                        {moment(badge.earnedDate).format('MM/DD/YYYY HH:mm:ss')}
                          </div>
                          </div>
                          </div>
                        ))
                           : 
                    <>
                    <img
                      src="https://c.animaapp.com/z2ODMQVf/img/frame-2.svg"
                      alt="No badges"
                      className="w-8 h-8"
                      />
                    <span className="font-semibold">
                      No Completion Badges earned yet
                    </span>
                    </>
                    }
                   
                  </div>
                </CardContent>
              </Card>

              {/* Topic Badges */}
              <Card>
                <CardHeader>
                  <CardTitle>Topic Completion Badges</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 h-[22rem]">
                  <ScrollArea className="h-full pr-4">
                    <div className="space-y-4">
                      {displayBadges.filter(badge=>badge.badgeType==="Topic").length > 0 ? (
                        displayBadges.filter(badge=>badge.badgeType==="Topic").map((badge) => (
                          <div
                            key={badge.id}
                            className="flex items-center gap-2.5 p-4 bg-[#F5F5F5] rounded-[5px]"
                          >
                            {/* <img src={badge.icon} alt="Badge" className="w-8 h-8" /> */}
                            <div className=" bg-emerald-900 rounded-full p-2 shadow-sm hover:scale-110 transition-transform duration-200">
                              <BookCheck className="w-7 h-7 text-emerald-100" />
                            </div>
                            <div>
                              <div className="font-semibold">{badge.title}</div>
                              <div className="text-sm text-gray-4">
                                <span className="font-bold">Earned on:</span>{" "}
                                {moment(badge.earnedDate).format('MM/DD/YYYY HH:mm:ss')}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center gap-2.5 p-4 bg-gray-0 rounded-[5px]">
                          <img
                            src="https://c.animaapp.com/z2ODMQVf/img/frame-2.svg"
                            alt="No badges"
                            className="w-8 h-8"
                          />
                          <span className="font-semibold">
                            No badges earned yet
                          </span>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Feedback Section */}
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src="https://c.animaapp.com/z2ODMQVf/img/frame-8.svg"
                    alt="Feedback"
                    className="w-6 h-6"
                  />
                  <CardTitle>Feedback</CardTitle>
                </div>

              </CardHeader>
              <CardContent className="h-[32rem]">
                <Separator className="my-4" />
                <ScrollArea className="h-full pr-4">
                <div className="space-y-4">
                  {displayFeedbacks.length > 0 ?
                    (
                      displayFeedbacks.map((entry, index) => (
                        <div
                          key={`${entry.date}-${index}`}
                          className="bg-[#F5F5F5] p-2 rounded-[5px]"
                        >
                          <div className="flex justify-between items-center p-3">
                            <div className="font-semibold ">
                              {entry.date}
                            </div>
                            <div className="font-semibold ">
                              {entry.givenBy}
                            </div>
                          </div>
                          <p className="text-sm  p-3">{entry.content}</p>
                        </div>
                      ))
                    )
                    : (
                    <div className="flex justify-center items-center p-3 h-[30rem]">
                      <span className="font-semibold">
                        No feedback available yet
                      </span>
                    </div>)}
                </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};
