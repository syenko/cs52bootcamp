import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, SignOutButton } from "@clerk/clerk-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import {
  PageContainer,
  MainContent,
  TwoColumnLayout,
  Card,
} from "@/components/layout";
import { Logo } from "@/components/logo";
import { H3 } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import {
  ChatMessageList,
  ChatInput,
  KomodoTypingIndicator,
} from "@/components/chat-message";
import * as ical from "ical";

interface DbMessage {
  _id: string;
  _creationTime: number;
  content: string;
  sender: "user" | "komodo";
  userId: string;
  userName: string;
  createdAt: number;
}

export function HomePage() {
  const { user } = useUser();
  const navigate = useNavigate();
  const createUser = useMutation(api.mutations.createUser);
  const createMessage = useMutation(api.mutations.createMessage);
  const saveFreeTimes = useMutation(api.mutations.saveFreeTimes);
  const currentUser = useQuery(api.queries.getCurrentUser);
  const allMessages = useQuery(api.queries.getAllMessages) || [];
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Create user on first login
  useEffect(() => {
    if (user && !currentUser) {
      createUser({
        name: user.fullName || "Anonymous",
        email: user.primaryEmailAddress?.emailAddress || "",
      });
    }
  }, [user, currentUser, createUser]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !user) return;

    setIsLoading(true);
    await createMessage({
      content,
      sender: "user",
    });
    setIsLoading(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  }; 

  const handleProcessFile = async () => {
    if (!selectedFile || !currentUser) return;
  
    setIsProcessing(true);
    const reader = new FileReader();
  
    reader.onload = async (e) => {
      const content = e.target?.result as string;
  
      try {
        const parsedData = ical.parseICS(content);
        const weeklyTimes: number[][][] = [[], [], [], [], []];
  
        const now = new Date();
        const monday = new Date(now);
        monday.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
        monday.setHours(0, 0, 0, 0);
  
        for (let dayIndex = 0; dayIndex < 5; dayIndex++) {
          const currentDay = new Date(monday);
          currentDay.setDate(monday.getDate() + dayIndex);
          
          const targetStart = new Date(currentDay);
          targetStart.setHours(11, 0, 0);
          const targetEnd = new Date(currentDay);
          targetEnd.setHours(13, 30, 0);
  
          const daysEvents = Object.values(parsedData)
            .filter((item: any) => item.type === "VEVENT")
            .filter((event: any) => event.start && event.end)
            .map((event: any) => ({
              start: new Date(event.start),
              end: new Date(event.end)
            }))
            .filter(event => event.start < targetEnd && event.end > targetStart)
            .map(event => ({
              start: new Date(Math.max(event.start.getTime(), targetStart.getTime())),
              end: new Date(Math.min(event.end.getTime(), targetEnd.getTime()))
            }))
            .sort((a, b) => a.start.getTime() - b.start.getTime());
  
          let currentTime = targetStart;
          for (const event of daysEvents) {
            if (currentTime < event.start) {
              weeklyTimes[dayIndex].push([
                currentTime.getHours() * 100 + currentTime.getMinutes(),
                event.start.getHours() * 100 + event.start.getMinutes()
              ]);
            }
            currentTime = event.end > currentTime ? event.end : currentTime;
          }
          
          if (currentTime < targetEnd) {

            if (currentTime.getHours() * 100 != targetEnd.getHours() * 100 || (targetEnd.getMinutes() - currentTime.getMinutes()) > 30) {
              weeklyTimes[dayIndex].push([
                currentTime.getHours() * 100 + currentTime.getMinutes(),
                targetEnd.getHours() * 100 + targetEnd.getMinutes()
              ]);
            }
          }
        }
  
        await saveFreeTimes({
          userId: currentUser._id,
          times: weeklyTimes
        });
  
        await createMessage({
          content: `Processed ${weeklyTimes.flat().length} meal time slots`,
          sender: "komodo"
        });
  
      } catch (error) {
        await createMessage({
          content: "Error processing schedule file",
          sender: "komodo"
        });
        console.error("Processing error:", error);
      } finally {
        setIsProcessing(false);
        setSelectedFile(null);
      }
    };
  
    reader.readAsText(selectedFile);
  };

  const getUserName = (msg: DbMessage) => {
    if (currentUser && msg.userId === currentUser._id) {
      return `You (${msg.userName})`;
    }
    return msg.userName;
  };

  return (
    <PageContainer>
      <header className="border-b border p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Logo />
          <SignOutButton>
            <Button variant="outline" size="sm">
              Sign Out
            </Button>
          </SignOutButton>
        </div>
      </header>

      <MainContent>
        <TwoColumnLayout>
          {/* Left Column - Chat */}
          <Card className="flex flex-col h-[70vh]">
            <H3 className="mb-4">Global Chat Channel</H3>
            <div className="flex-1 overflow-y-auto mb-4">
              <ChatMessageList
                messages={allMessages.map((msg: DbMessage) => ({
                  content: msg.content,
                  sender: msg.sender,
                  timestamp: new Date(msg.createdAt),
                  userName: getUserName(msg),
                }))}
              />
              {isLoading && <KomodoTypingIndicator />}
            </div>
            <ChatInput onSendMessage={handleSendMessage} />
          </Card>

          {/* Right Column - Upload Schedule */}
          <Card className="flex flex-col gap-4">
            <H3>Upload Schedule</H3>
            <input
              type="file"
              id="fileInput"
              accept=".ics"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => document.getElementById("fileInput")?.click()}
              >
                {selectedFile ? `Selected: ${selectedFile.name}` : "Select ICS File"}
              </Button>
              <Button
                variant="solid"
                onClick={handleProcessFile}
                disabled={!selectedFile || isProcessing}
              >
                {isProcessing ? "Processing..." : "Upload Schedule"}
              </Button>
            </div>
          </Card>
        </TwoColumnLayout>
      </MainContent>
    </PageContainer>
  );
}
