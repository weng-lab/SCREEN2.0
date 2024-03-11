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

  return (
    <ConfigureGenomeBrowser
      biosampleData={biosampleData}
      coordinates={coordinates}
      accession={accession}
    />
  )
}

export default ConfigureGBTab