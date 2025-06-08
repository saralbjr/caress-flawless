"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function AdminSettingsPage() {
  const router = useRouter();

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="h-7 w-7 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Admin Settings</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <span className="font-medium">Store Name:</span> Caress&Flawless
            </div>
            <div>
              <span className="font-medium">Admin Email:</span> admin@gmail.com
            </div>
            <div>
              <span className="font-medium">Theme:</span> Light/Dark
            </div>
            <Button disabled variant="outline">Edit Settings (Coming Soon)</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
