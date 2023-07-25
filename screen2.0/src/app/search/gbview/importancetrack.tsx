/*import { gql, useQuery } from "@apollo/client";
import { BigWigData, BigBedData, BigZoomData } from "bigwig-reader";
import React, { RefObject, useEffect, useMemo, useState } from "react";
import { DenseBigBed, EmptyTrack, FullBigWig } from "umms-gb";
import { GraphQLImportanceTrack } from "bpnet-ui"
import {
  BigRequest,
  RequestError,
} from "umms-gb/dist/components/tracks/trackset/types";
import { ValuedPoint } from "umms-gb/dist/utils/types";
import { client } from "../ccredetails/client"


export const BIG_QUERY = gql`
  query BigRequests($bigRequests: [BigRequest!]!) {
    bigRequests(requests: $bigRequests) {
      data
      error {
        errortype
        message
      }
    }
  }
`;


type GenomicRange = {
  chromosome?: string;
  start: number;
  end: number;
};

export type BigResponseData =
  | BigWigData[]
  | BigBedData[]
  | BigZoomData[]
  | ValuedPoint[];

export type BigResponse = {
  data: BigResponseData;
  error: RequestError;
};

export type BigQueryResponse = {
  bigRequests: BigResponse[];
};

type ImportanceTrackProps = {
  //tracks: BigRequest[];
  coordinates: GenomicRange;
  domain: GenomicRange;
  onHeightChanged?: (i: number) => void;
  cCREHighlight?: GenomicRange;
  cCREHighlights?: Set<string>;
  svgRef?: RefObject<SVGSVGElement>;
  assembly: string;
  oncCREClicked?: (accession: string) => void;
  oncCREMousedOver?: (coordinates?: GenomicRange) => void;
  oncCREMousedOut?: () => void;
  onSettingsClick?: () => void;
};

export const TitledTrack: React.FC<{
  coordinates: GenomicRange;
  url: string;
  assembly: string;
  title: string;
  
  height: number;
  transform?: string;
  onHeightChanged?: (height: number) => void;
  domain: GenomicRange;
  svgRef?: React.RefObject<SVGSVGElement>;
}> = ({
  
  url,
  title,
  height,
  domain,
  transform,
  onHeightChanged,
  svgRef,
  coordinates,
  assembly
  
}) => {
  useEffect(
    () => onHeightChanged && onHeightChanged(height + 40),
    [height, onHeightChanged]
  );
  
  return (
    <g transform={transform}>
      <EmptyTrack
        height={40}
        width={1400}
        transform="translate(0,8)"
        id=""
        text={title}
      />
      {coordinates.end - coordinates.start < 5000 ? (
        <GraphQLImportanceTrack
          width={1000}
          height={height}
          endpoint="https://ga.staging.wenglab.org"
          signalURL={url}
          sequenceURL={assembly==="GRCh38" ?"gs://gcp.wenglab.org/hg38.2bit" :"gs://gcp.wenglab.org/mm10.2bit"}
          coordinates={coordinates}
          key={`${coordinates.chromosome}:${coordinates.start}-${coordinates.end}-${url}`}
        />
      ) : (
        <>
        </>
      )}
    </g>
  );
};

const ImportanceTrack: React.FC<ImportanceTrackProps> = (props) => {
    
  const [cTracks, setTracks] = useState<[string, string][]>( props.assembly.toLowerCase()==='mm10' ? [
    [
        "Sequence Importance gs://gcp.wenglab.org/mm10.phylop.bigWig",
         "gs://gcp.wenglab.org/mm10.phylop.bigWig",
        
      ]
  ] :  [
    [
        "Sequence Importance gs://gcp.wenglab.org/241-mammalian-2020v2.bigWig",
        "gs://gcp.wenglab.org/241-mammalian-2020v2.bigWig"
        
      ]
  ]);
  const height = useMemo(() => cTracks.length * 100, [cTracks]);
  /*const bigRequests = useMemo(
    () =>
      cTracks.map((x) => ({
        chr1: props.domain.chromosome!,
        start: props.domain.start,
        end: props.domain.end,
        preRenderedWidth: 1400,
        url: x[1],
      })),
    [cTracks, props]
  );
  const { data, loading } = useQuery<BigQueryResponse>(BIG_QUERY, {
    variables: { bigRequests },
    client
  });*/
  useEffect(() => {
    props.onHeightChanged && props.onHeightChanged(height);
  }, [props.onHeightChanged, height, props]);

  const [settingsMousedOver, setSettingsMousedOver] = useState(false);
  const [settingsModalShown, setSettingsModalShown] = useState(false);

  return (
    <>
      <g className="encode-fetal-brain">
        <rect y={10} height={55} fill="none" width={1400} />
      </g>
      {(cTracks).map((data, i) => (
        <TitledTrack
        coordinates={props.coordinates}
        assembly={props.assembly}
          height={40}
          url={cTracks[i][1]}
          domain={props.domain}
          title={cTracks[i][0]}
          svgRef={props.svgRef}          
          transform={`translate(0,${i * 90})`}
        />
      ))}
      <g className="tf-motifs">
        <rect y={110} height={55} fill="none" width={1400} />
      </g>
      {settingsMousedOver && (
        <rect
          width={1400}
          height={height}
          transform="translate(0,-0)"
          fill="#4c1f8f"
          fillOpacity={0.1}
        />
      )}
      <rect
        transform="translate(0,0)"
        height={height}
        width={40}
        fill="#ffffff"
      />
      <rect
        height={height}
        width={15}
        fill="#4c1f8f"
        stroke="#000000"
        fillOpacity={settingsMousedOver ? 1 : 0.6}
        onMouseOver={() => setSettingsMousedOver(true)}
        onMouseOut={() => setSettingsMousedOver(false)}
        strokeWidth={1}
        transform="translate(20,0)"
        onClick={() => {
          props.onSettingsClick && props.onSettingsClick();
          setSettingsModalShown(true);
        }}
      />
      <text
        transform={`rotate(270) translate(-${height / 2},12)`}
        textAnchor="middle"
        fill="#4c1f8f"
      >
        Importance Tracks
      </text>
    </>
  );
};
export default ImportanceTrack;
*/