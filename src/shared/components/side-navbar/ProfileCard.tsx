import { Upload, User2, LogOut } from "lucide-react";

export function ProfileCard() {
  return (
    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
      <div className="px-4 py-2 text-sm font-medium text-gray-900">
        My Account
      </div>
      <div className="divide-y divide-gray-100">
        <div className="py-1">
          <a
            href="#"
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <Upload className="mr-3 h-4 w-4" />
            Update Picture
          </a>
          <a
            href="#"
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <User2 className="mr-3 h-4 w-4" />
            Profile
          </a>
        </div>
        <div className="py-1">
          <a
            href="#"
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <LogOut className="mr-3 h-4 w-4" />
            Logout
          </a>
        </div>
      </div>
    </div>
  );
}
