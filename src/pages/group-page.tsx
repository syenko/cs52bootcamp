import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { PageContainer } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";

export function GroupPage() {
  const navigate = useNavigate();
  const createGroup = useMutation(api.mutations.createGroup);
  const joinGroup = useMutation(api.mutations.joinGroup);
  const [isLoading, setIsLoading] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupJoinCode, setGroupJoinCode] = useState("");
  const groups = useQuery(api.queries.getGroups);
  const currentUser = useQuery(api.queries.getCurrentUser);
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
            <div className="text-lg font-bold">Your Groups</div>
            <div>
              {groups?.map((group) => (
                <div
                  key={group._id}
                  className="hover:cursor-pointer"
                  onMouseEnter={(e) =>
                    (e.currentTarget.textContent = group._id)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.textContent = group.name)
                  }
                >
                  {group.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
