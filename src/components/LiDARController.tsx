import { useSnapshot } from "valtio";
import state from "../store";
import { Button } from "../components/ui/button";

export default function LiDARController() {
  const snap = useSnapshot(state);
  function downloadCSV() {
    const headers = ["x", "y", "z"];
    const rows = snap.hitPoints.map((vec) => [
      vec.x.toFixed(2),
      vec.y.toFixed(2),
      vec.z.toFixed(2),
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hit_points.csv";
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <div className="absolute top-20 right-0 w-auto bg-black bg-opacity-40 px-4 py-2 z-10">
      <div className="flex flex-col gap-5">
        <div className="flex flex-row justify-between text-white ">
          Hit count : <p className=""> {snap.hitCount} </p>
        </div>
        <Button onClick={downloadCSV} variant={"ghost"}>
          Download CSV
        </Button>
      </div>
    </div>
  );
}
