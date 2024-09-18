import ConfigureGenomeBrowser from "./configuregb";


interface Props {
  coordinates: {
    assembly: "mm10" | "GRCh38",
    chromosome: string,
    start: number,
    end: number,
  }
  accession: string
}

const ConfigureGBTab: React.FC<Props> = ({
  coordinates,
  accession
 }) => {

  return (
    <ConfigureGenomeBrowser
      coordinates={coordinates}
      accession={accession}
    />
  )
}

export default ConfigureGBTab