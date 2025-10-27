import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Edit, Mail, Calendar, BookOpen, Sparkles } from "lucide-react";

const ProfileHeader = ({ user, editing, onEditClick }) => {
  if (!user) return null;

  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-3xl p-8 text-white shadow-2xl mb-8">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      ></div>

      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
          <div className="flex items-center space-x-6">
            {/* Avatar */}
            <Avatar className="h-20 w-20 border-4 border-white/20 shadow-xl">
              <AvatarFallback className="text-2xl font-bold bg-white/20 text-white">
                {user.name?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            {/* User Info */}
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-4xl lg:text-5xl font-bold">{user.name}</h1>
                <Sparkles className="h-8 w-8 text-yellow-300 animate-pulse" />
              </div>
              <p className="text-xl text-blue-100 mb-4">
                Your Learning Profile
              </p>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center space-x-2 bg-white/10 rounded-full px-3 py-1">
                  <Mail className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 rounded-full px-3 py-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Joined{" "}
                    {user.created_at
                      ? new Date(user.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Recently"}
                  </span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 rounded-full px-3 py-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{user.subjects_of_interest?.length || 0} subjects</span>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Button */}
          {!editing && (
            <div className="flex items-center space-x-4">
              <Button
                onClick={onEditClick}
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border-white/20"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Animated background elements */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl -translate-y-36 translate-x-36 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-500/20 to-transparent rounded-full blur-3xl translate-y-48 -translate-x-48 animate-pulse delay-1000"></div>
    </section>
  );
};

export default ProfileHeader;
