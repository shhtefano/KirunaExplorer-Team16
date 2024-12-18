import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { User, Building2, Contact, Mail, MapPinHouse } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import profilePic from "@/assets/profile.png";

export const UserProfileCard = ({ user }) => {
  return (
    <Card className="min-w-[270px] max-w-[750px] w-full mt-4 bg-white/60 backdrop-blur-sm transition-all hover:shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <img
              src={profilePic}
              alt="Profile"
              className="h-full w-full rounded-full object-cover"
            />          </div>
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold">
              Welcome back, {user.username}!
            </h2>
            <div className="flex items-center gap-2 mt-1">
              {user.role === "urban_planner" ? (
                <Building2 size={18} className="text-black" />
              ) : (
                <MapPinHouse size={18} className="text-black" />
              )}

              <Badge
                variant="primary"
                className="text-sm text-white bg-slate-700"
              >
                {user.role === "urban_planner" ? "Urban Planner" : "Resident"}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/60 transition-colors hover:bg-white">
            <Mail size={22} className="text-black" />
            <div className="flex flex-col items-start">
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">
                {user.email || "kiruna@gmail.com"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/60 transition-colors hover:bg-white">
            <Contact size={22} className="text-black" />
            <div className="flex flex-col items-start">
              <p className="text-sm font-medium">Name</p>
              <p className="text-sm text-muted-foreground">Lorenzo Bonucci</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
