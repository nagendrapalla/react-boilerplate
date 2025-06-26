import React, { useState, useRef, useEffect } from "react";
import {

  ChevronRight,
  House,
  LayoutGrid,
  LogOut,
  User2,
  FileQuestion,
  Cog,
} from "lucide-react";
import { NavItem } from "./NavItem";
import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { atom, useAtom } from "jotai";
import { getInitials } from "@/shared/utlis/getIntial";
import { globalLogout, useName, useRole } from "@/domains/auth/store/authAtom";

// Global navigation state atom
export const activeNavAtom = atom<string>("/training/student");

export const SideNavbar = () => {
  const [isExpand, setIsExpand] = React.useState(false);
  const [showProfileCard, setShowProfileCard] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const router = useRouter();
  const role = useRole();
  const name = useName();
  const [activeNav, setActiveNav] = useAtom(activeNavAtom);

  React.useEffect(() => {
    const currentPath = router.state.location.pathname;
    setActiveNav(currentPath);
  }, [router.state.location.pathname, setActiveNav]);

  const handleLogout = () => {
    // Use the global logout function that works from any route
    globalLogout();
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setShowProfileCard(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setShowProfileCard(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Helper function to check if a route is active
  const isRouteActive = (path: string) => {
    if (path === "/training/student" || path === "/training/tutor") {
      return activeNav === path;
    }
    return activeNav.startsWith(path);
  };

  const handleHomeClick = () => {
    const homePath = role === "ROLE_Instructor" ? "/training/tutor" : "/training/student";
    setActiveNav(homePath);
    navigate({ to: homePath });
  };

  return (
    <div
      className={`bg-[#DDE2E5] transition-all h-screen relative duration-700 ease-in-out flex flex-col justify-between side-navbar-container ${isExpand ? "w-[12rem]" : "w-[5rem]"
        }`}
    >
      <section className="px-4">
        <ChevronRight
          size={30}
          className={`bg-white p-1 rounded-lg cursor-pointer absolute bottom-2 -right-5 transition-transform duration-700 ease-in-out ${isExpand ? "rotate-180" : ""
            }`}
          onClick={() => setIsExpand(!isExpand)}
        />

        <div className="pt-[1.375rem] flex justify-center">
          <div className={`transition-all duration-700 ease-in-out`}>
            <img
              src="/training/images/hctra-emblem.svg"
              alt="HCTRA Emblem"
              className="w-[3.875rem] h-[3.875rem] transition-transform duration-700 ease-in-out"
            />
          </div>
        </div>

        {/* NAV ITEMS STARTS HERE */}
        <div className="mt-8 space-y-3">
          <div className="cursor-pointer" onClick={handleHomeClick}>
            <NavItem
              icon={House}
              label="Dashboard"
              isExpand={isExpand}
              isActive={isRouteActive(
                role === "ROLE_Instructor" ? "/training/tutor" : "/training/student"
              )}
            />
          </div>

          {/* Always show these items for authenticated users */}
          {role === "ROLE_Instructor" && (

            <Link
              to="/training/student/all-courses"
              activeProps={{
                className: "font-bold",
              }}
              preload="intent"
              onClick={() => setActiveNav("/training/student/all-courses")}
            >
              <NavItem
                icon={LayoutGrid}
                label="Courses"
                isExpand={isExpand}
                isActive={isRouteActive("/training/student/all-courses")}
              />
            </Link>
          )}

          {/* Only show leaderboard for non-instructors */}
          {/* {role !== "ROLE_Instructor" && (
            <Link
              to="/training/student/leaderboard"
              activeProps={{
                className: "font-bold",
              }}
              preload="intent"
              onClick={() => setActiveNav("/training/student/leaderboard")}
            >
              <NavItem
                icon={Award}
                label="Leaderboard"
                isExpand={isExpand}
                isActive={isRouteActive("/training/student/leaderboard")}
              />
            </Link>
          )} */}

          {role === "ROLE_Instructor" && (
            <Link
              to="/training/config"
              activeProps={{
                className: "font-bold",
              }}
              preload="intent"
              onClick={() => setActiveNav("/training/config")}
            >
              <NavItem
                icon={Cog}
                label="Configuration"
                isExpand={isExpand}
                isActive={isRouteActive("/training/config")}
              />
            </Link>
          )}

          {/* {role === "ROLE_Instructor" && (
            <Link
              to="/training/analytics"
              activeProps={{
                className: "font-bold",
              }}
              preload="intent"
              onClick={() => setActiveNav("/training/analytics")}
            >
              <NavItem
                icon={ChartNoAxesCombined}
                label="Analytics"
                isExpand={isExpand}
                isActive={isRouteActive("/training/analytics")}
              />
            </Link>
          )} */}

          <Link
            to="/training/faq"
            activeProps={{
              className: "font-bold",
            }}
            preload="intent"
            onClick={() => setActiveNav("/training/faq")}
          >
            <NavItem
              icon={FileQuestion}
              label="FAQ"
              isExpand={isExpand}
              isActive={isRouteActive("/training/faq")}
            />
          </Link>
        </div>
      </section>

      <section className="mb-8 space-y-6">
        <div className="relative" ref={profileRef}>
          <div className={`${isExpand ? "w-full flex items-center justify-center py-2" : "w-[5rem] flex items-center"} mb-3` }>
          <div
            className={`${isExpand ? "flex justify-center cursor-pointer" : "w-[5rem] flex justify-center cursor-pointer mb-2"}`}
            onClick={() => setShowProfileCard(!showProfileCard)}
          >
            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-sm text-white font-medium">
              {getInitials(name)}
            </div>
          </div>
            {isExpand && (
              <div className="pl-3">
                <p className="text-sm font-medium text-gray-900">{name}</p>
              </div>
            )}
          </div>

          {showProfileCard && (
            <div className="absolute left-8 -top-[8.5rem] w-48 bg-white rounded-md shadow-lg py-1 z-10">
              <div className="px-4 py-2 text-sm font-medium text-gray-900">
                My Account
              </div>
              <div className="divide-y divide-gray-100">
                <div className="py-1">
                  {/* <a
                    href="#"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Upload className="mr-3 h-4 w-4" />
                    Update Picture
                  </a> */}
                  <Link
                    to="/training/user-profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowProfileCard(false)}
                  >
                    <User2 className="mr-3 h-4 w-4" />
                    Profile
                  </Link>
                </div>
                <div className="py-1">
                  <div
                    onClick={handleLogout}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    Logout
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
