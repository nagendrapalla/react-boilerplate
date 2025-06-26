// import React from "react";
import { LucideIcon } from "lucide-react";

interface NavItemProps {
  icon: LucideIcon;
  label: string;
  isExpand: boolean;
  isActive?: boolean;
}

export const NavItem = ({ icon: Icon, label, isExpand, isActive }: NavItemProps) => (
  <div
    className={`rounded-md ${isExpand ? "flex items-center p-2 space-x-4" : ""} ${
      isActive ? "bg-white" : ""
    }`}
  >
    <div
      className={`transition-all duration-700 ease-in-out ${
        isExpand ? "" : "flex justify-center"
      }`}
    >
      <Icon
        size={isExpand ? 30 : 46}
        strokeWidth={1.5}
        className={`${isExpand ? "" : "p-2"} ${
          isActive ? "text-[#475467]" : "text-gray-600"
        }`}
      />
    </div>
    {isExpand && (
      <p
        className={`text-base transition-all duration-700 ease-in-out ${
          isExpand ? "opacity-100" : "opacity-0"
        } ${isActive ? "font-semibold text-gray-700" : "text-gray-600"}`}
      >
        {label}
      </p>
    )}
  </div>
);
