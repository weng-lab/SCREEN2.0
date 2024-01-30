import { useState } from "react";
import { CellTypeData, RegistryBiosamplePlusRNA } from "../types";
import ConfigureGenomeBrowser from "./configuregb";
import { ApolloQueryResult } from "@apollo/client";
import { BIOSAMPLE_Data } from "../../../common/lib/queries";


interface Props {
  biosampleData: ApolloQueryResult<BIOSAMPLE_Data>
  coordinates: {
    assembly: "mm10" | "GRCh38",
    chromosome: string,
    start: number,
    end: number,
  }
  accession: string
}

const ConfigureGBTab: React.FC<Props> = ({
  biosampleData,
  coordinates,
  accession
 }) => {
  const [selectedBiosamples, setSelectedBiosamples] = useState<RegistryBiosamplePlusRNA[]>([])

  return (
    <ConfigureGenomeBrowser
      biosampleData={biosampleData}
      selectedBiosamples={selectedBiosamples}
      setSelectedBiosamples={setSelectedBiosamples}
      coordinates={coordinates}
      accession={accession}
    />
  )
}

export default ConfigureGBTab