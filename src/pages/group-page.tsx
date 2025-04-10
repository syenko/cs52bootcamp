import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { PageContainer } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
export function GroupPage() {
  const navigate = useNavigate();
  const createGroup = useMutation(api.mutations.createGroup);
  const joinGroup = useMutation(api.mutations.joinGroup);
  const leaveGroup = useMutation(api.mutations.leaveGroup);
  const [isLoading, setIsLoading] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupJoinCode, setGroupJoinCode] = useState("");
  const groups = useQuery(api.queries.getGroups);
  const [error, setError] = useState("");

  const handleCreateGroup = async (groupName: string) => {
    if (groupName.length === 0) {
      return;
    }
    setIsLoading(true);
    await createGroup({
      name: groupName,
    });
    setGroupName("");
    setIsLoading(false);
  };

  const handleJoinGroup = async (groupJoinCode: string) => {
    if (groupJoinCode.length === 0) {
      return;
    }
    setIsLoading(true);
    try {
      await joinGroup({
        groupId: groupJoinCode,
      });
      setGroupJoinCode("");
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("User already in group")
      ) {
        setError("User already in group");
      } else {
        setError("Invalid group join code");
      }
    }
    setIsLoading(false);
  };

  const handleLeaveGroup = async (groupId: string) => {
    try {
      await leaveGroup({
        groupId,
      });
    } catch (error) {
      setError("Error leaving group");
    }
  };

  const copyGroupJoinCode = (groupJoinCode: string) => {
    navigator.clipboard.writeText(groupJoinCode);
  };

  useEffect(() => {
    setError("");
  }, [groupJoinCode]);

  return (
    <PageContainer>
      <div>
        <h2 className="text-center py-4 text-2xl font-bold">Groups</h2>
        <div className="flex flex-col justify-center items-center gap-4">
          <div className="flex flex-col gap-4">
            <div>
              <div className="text-lg font-bold mb-2">Create New Group</div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCreateGroup(groupName);
                }}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-2">
                  <Label>Group Name</Label>
                  <Input
                    placeholder="Group Name"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                  />
                </div>
                <Button size="lg" type="submit" disabled={!groupName}>
                  Create New Group
                </Button>
              </form>
            </div>
            <div>
              <div className="text-lg font-bold mb-2">Join Existing Group</div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleJoinGroup(groupJoinCode);
                }}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-2">
                  <Label>Group Join Code</Label>
                  <Input
                    placeholder="Group Join Code"
                    value={groupJoinCode}
                    onChange={(e) => setGroupJoinCode(e.target.value)}
                  />
                  {error && <div className="text-red-500 text-sm">{error}</div>}
                </div>
                <Button size="lg" type="submit" disabled={!groupJoinCode}>
                  Join Group
                </Button>
              </form>
            </div>
          </div>
          <div>
            <div className="text-lg font-bold mb-2">Your Groups</div>
            <div className="flex flex-col gap-2">
              {/* Display groups you are in */}
              {groups?.map((group) => (
                <div
                  key={group._id}
                  className="flex justify-between items-center px-4 py-2 outline rounded-md gap-4"
                >
                  <div>{group.name}</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyGroupJoinCode(group._id)}
                      className="cursor-pointer"
                    >
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 15 15"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M5 2V1H10V2H5ZM4.75 0C4.33579 0 4 0.335786 4 0.75V1H3.5C2.67157 1 2 1.67157 2 2.5V12.5C2 13.3284 2.67157 14 3.5 14H7V13H3.5C3.22386 13 3 12.7761 3 12.5V2.5C3 2.22386 3.22386 2 3.5 2H4V2.25C4 2.66421 4.33579 3 4.75 3H10.25C10.6642 3 11 2.66421 11 2.25V2H11.5C11.7761 2 12 2.22386 12 2.5V7H13V2.5C13 1.67157 12.3284 1 11.5 1H11V0.75C11 0.335786 10.6642 0 10.25 0H4.75ZM9 8.5C9 8.77614 8.77614 9 8.5 9C8.22386 9 8 8.77614 8 8.5C8 8.22386 8.22386 8 8.5 8C8.77614 8 9 8.22386 9 8.5ZM10.5 9C10.7761 9 11 8.77614 11 8.5C11 8.22386 10.7761 8 10.5 8C10.2239 8 10 8.22386 10 8.5C10 8.77614 10.2239 9 10.5 9ZM13 8.5C13 8.77614 12.7761 9 12.5 9C12.2239 9 12 8.77614 12 8.5C12 8.22386 12.2239 8 12.5 8C12.7761 8 13 8.22386 13 8.5ZM14.5 9C14.7761 9 15 8.77614 15 8.5C15 8.22386 14.7761 8 14.5 8C14.2239 8 14 8.22386 14 8.5C14 8.77614 14.2239 9 14.5 9ZM15 10.5C15 10.7761 14.7761 11 14.5 11C14.2239 11 14 10.7761 14 10.5C14 10.2239 14.2239 10 14.5 10C14.7761 10 15 10.2239 15 10.5ZM14.5 13C14.7761 13 15 12.7761 15 12.5C15 12.2239 14.7761 12 14.5 12C14.2239 12 14 12.2239 14 12.5C14 12.7761 14.2239 13 14.5 13ZM14.5 15C14.7761 15 15 14.7761 15 14.5C15 14.2239 14.7761 14 14.5 14C14.2239 14 14 14.2239 14 14.5C14 14.7761 14.2239 15 14.5 15ZM8.5 11C8.77614 11 9 10.7761 9 10.5C9 10.2239 8.77614 10 8.5 10C8.22386 10 8 10.2239 8 10.5C8 10.7761 8.22386 11 8.5 11ZM9 12.5C9 12.7761 8.77614 13 8.5 13C8.22386 13 8 12.7761 8 12.5C8 12.2239 8.22386 12 8.5 12C8.77614 12 9 12.2239 9 12.5ZM8.5 15C8.77614 15 9 14.7761 9 14.5C9 14.2239 8.77614 14 8.5 14C8.22386 14 8 14.2239 8 14.5C8 14.7761 8.22386 15 8.5 15ZM11 14.5C11 14.7761 10.7761 15 10.5 15C10.2239 15 10 14.7761 10 14.5C10 14.2239 10.2239 14 10.5 14C10.7761 14 11 14.2239 11 14.5ZM12.5 15C12.7761 15 13 14.7761 13 14.5C13 14.2239 12.7761 14 12.5 14C12.2239 14 12 14.2239 12 14.5C12 12.7761 12.2239 15 12.5 15Z"
                          fill="currentColor"
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                        ></path>
                      </svg>
                    </button>
                    <button
                      onClick={() => handleLeaveGroup(group._id)}
                      className="cursor-pointer"
                    >
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 15 15"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3 1C2.44771 1 2 1.44772 2 2V13C2 13.5523 2.44772 14 3 14H10.5C10.7761 14 11 13.7761 11 13.5C11 13.2239 10.7761 13 10.5 13H3V2L10.5 2C10.7761 2 11 1.77614 11 1.5C11 1.22386 10.7761 1 10.5 1H3ZM12.6036 4.89645C12.4083 4.70118 12.0917 4.70118 11.8964 4.89645C11.7012 5.09171 11.7012 5.40829 11.8964 5.60355L13.2929 7H6.5C6.22386 7 6 7.22386 6 7.5C6 7.77614 6.22386 8 6.5 8H13.2929L11.8964 9.39645C11.7012 9.59171 11.7012 9.90829 11.8964 10.1036C12.0917 10.2988 12.4083 10.2988 12.6036 10.1036L14.8536 7.85355C15.0488 7.65829 15.0488 7.34171 14.8536 7.14645L12.6036 4.89645Z"
                          fill="currentColor"
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                        ></path>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
