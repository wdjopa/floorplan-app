"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAreas } from "@/hooks/useAreas";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import WorkspaceEditor from "@/components/editor/WorkspaceEditor";
import CreateAreaDialog from "@/components/editor/CreateAreaDialog";

export default function EditorPage() {
  const { areas, loading, error, createArea } = useAreas();
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center text-red-500">
        Error: {error.message}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="flex h-16 items-center px-4">
          <h1 className="text-lg font-semibold">Floor Plan Editor</h1>
          <div className="ml-auto flex items-center space-x-4">
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Area
            </Button>
          </div>
        </div>
      </header>

      <main className="p-4">
        {areas.length > 0 ? (
          <Tabs
            defaultValue={areas[0]?.id}
            onValueChange={setSelectedArea}
            className="h-full space-y-6"
          >
            <div className="space-between flex items-center">
              <TabsList>
                {areas.map((area) => (
                  <TabsTrigger key={area.id} value={area.id}>
                    {area.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {areas.map((area) => (
              <TabsContent
                key={area.id}
                value={area.id}
                className="border-none p-0"
              >
                <WorkspaceEditor areaId={area.id} />
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="flex h-[500px] items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-semibold">No Areas Found</h3>
              <p className="text-muted-foreground">
                Create an area to start adding tables.
              </p>
              <Button
                className="mt-4"
                onClick={() => setShowCreateDialog(true)}
              >
                Create Area
              </Button>
            </div>
          </div>
        )}
      </main>

      <CreateAreaDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onCreate={createArea}
      />
    </div>
  );
}
