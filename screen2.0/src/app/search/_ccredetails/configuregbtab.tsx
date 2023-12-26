import { useState } from "react";
import { Biosample, CellTypeData } from "../types";
import ConfigureGenomeBrowser from "./configuregb";


interface Props {
  byCellType: CellTypeData
  coordinates: {
    assembly: "mm10" | "GRCh38",
    chromosome: string,
    start: string,
    end: string,
  }
  accession: string
}

const ConfigureGBTab: React.FC<Props> = ({
  byCellType,
  coordinates,
  accession
 }) => {
  const [selectedBiosamples, setSelectedBiosamples] = useState<Biosample[]>([])

  return (
    <ConfigureGenomeBrowser
      byCellType={byCellType}
      selectedBiosamples={selectedBiosamples}
      setSelectedBiosamples={setSelectedBiosamples}
      coordinates={coordinates}
      accession={accession}
    />
  )
}

export default ConfigureGBTab