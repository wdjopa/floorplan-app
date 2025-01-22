"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAreas } from "@/hooks/useAreas";
import { Button } from "@/components/ui/button";
import { useGenukaContext } from "@/providers/genuka";
import { Loader2 } from "lucide-react";
import TableGrid from "../../components/floorplan/TableGrid";
import BookingModal from "../../components/floorplan/BookingModal";

export default function FloorplanPage() {
  const { loading: genukaLoading } = useGenukaContext();
  const { areas, loading: areasLoading } = useAreas();
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  if (genukaLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        Initializing Genuka...
      </div>
    );
  }
  if (areasLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        Loading Areas...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="flex h-16 items-center px-4">
          <h1 className="text-lg font-semibold">Floorplan Management</h1>
          <div className="ml-auto flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/editor")}
            >
              Edit Floorplan
            </Button>
          </div>
        </div>
      </header>

      <main className="p-4">
        {areas.length > 0 ? (
          <Tabs
            defaultValue={selectedArea || areas[0]?.id}
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
                <TableGrid
                  areaId={area.id}
                  onTableSelect={(tableId) => {
                    setSelectedTable(tableId);
                    setIsBookingModalOpen(true);
                  }}
                />
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="flex h-[500px] items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-semibold">No Areas Found</h3>
              <p className="text-muted-foreground">
                Create areas and tables in the editor first.
              </p>
              <Button
                className="mt-4"
                onClick={() => (window.location.href = "/editor")}
              >
                Go to Editor
              </Button>
            </div>
          </div>
        )}
      </main>

      <BookingModal
        open={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setSelectedTable(null);
        }}
        tableId={selectedTable}
      />
    </div>
  );
}
