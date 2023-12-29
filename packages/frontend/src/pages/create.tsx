import CreateDashboard from "@/components/CreateDashboard";
import CreateShowQuizList from "@/components/CreateShowQuizList";
import { useParams } from "react-router-dom";

export default function Create() {
  const { wid } = useParams();
  
  return (
    <>
      {
        !wid ? 
        <CreateDashboard/>
        :
        <CreateShowQuizList 
          key={wid}
          wid={wid}
        />
      }
    </>
  )
}