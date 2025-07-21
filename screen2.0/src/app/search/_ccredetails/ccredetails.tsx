"use client";
import React, { useMemo } from "react";
import { Typography, Stack, Divider, CircularProgress } from "@mui/material";
import { GenomicRegion } from "../types";
import { InSpecificBiosamples } from "./BiosampleActivity/inspecificbiosample";
import { NearByGenomicFeatures } from "./nearbygenomicfeatures";
import { LinkedGenes } from "./linkedgenes";
import { Ortholog } from "./linkedccres";
import { TfIntersection } from "./tfintersection";
import { FunctionData } from "./functionaldata";
import ChromHMM from "./_chromhmm/chromhmm";
import { ENTExData } from "./entexdata";
import { Silencers } from "./silencers";
import Rampage from "./rampage";
import { GeneExpression } from "../../applets/gene-expression/geneexpression";
import TfSequenceFeatures from "../_gbview/tfsequencefeatures";
import ConfigureGBTab from "./configuregbtab";
import { useQuery } from "@apollo/client";
import {
  ComputationalGeneLinks_Query,
  NEARBY_AND_LINKED_GENES,
} from "./queries";
import { calcDistToTSS } from "./utils";
import { LoadingMessage } from "../../../common/lib/utility";
import { ComputationalGeneLinksQuery, ComputationalGeneLinksQueryVariables } from "../../../graphql/__generated__/graphql";

//Passing these props through this file could be done with context to reduce prop drilling
type CcreDetailsProps = {
  accession: string;
  assembly: "GRCh38" | "mm10";
  region: GenomicRegion;
  page: number;
  handleOpencCRE: (row: any) => void;
};

export type LinkedGeneInfo = {
  p_val: number;
  gene: string;
  geneid: string;
  genetype: string;
  method: "CRISPR" | "Chromatin" | "eQTLs";
  accession: string;
  grnaid: string;
  effectsize: number;
  assay: "RNAPII-ChIAPET" | "CTCF-ChIAPET" | "Intact-HiC" | "CRISPRi-FlowFISH";
  celltype: string;
  experiment_accession: string;
  score: number;
  variantid: string;
  source: string;
  slope: number;
  tissue: string;
  displayname: string;
};

type Coordinates = {
  chromosome: string;
  start: number;
  end: number;
};

type NearbyGeneInfo = {
  name: string;
  id: string;
  gene_type: string;
  strand: "+" | "-";
  coordinates: Coordinates;
  transcripts: {
    id: string;
    coordinates: Coordinates;
  }[];
};

export type NearbyGeneInfoWithDistance = NearbyGeneInfo & {
  distanceToTSS: number;
};

export type NearbyAndLinked = {
  nearbyGenes: NearbyGeneInfo[];
  linkedGenes: LinkedGeneInfo[];
};

export type NearbyWithDistanceAndLinked = {
  nearbyGenes: NearbyGeneInfoWithDistance[];
  linkedGenes: LinkedGeneInfo[];
  otherComputationalLinkedGenes: ComputationalGeneLinksQuery["ComputationalGeneLinksQuery"];
};

export type NearbyAndLinkedVariables = {
  accessions: string[];
  assembly: string;
  geneSearchStart: number;
  geneSearchEnd: number;
  geneSearchChrom: string;
  geneVersion: 40 | 25;
};

export const CcreDetails: React.FC<CcreDetailsProps> = ({
  accession,
  region,
  assembly,
  page,
  handleOpencCRE,
}) => {
  //Fetch linked genes and genes within a 2M bp window around cCRE
  const {
    loading: loadingLinkedGenes,
    data: dataNearbyAndLinked,
    error: errorNearbyAndLinked,
  } = useQuery<NearbyAndLinked, NearbyAndLinkedVariables>(
    NEARBY_AND_LINKED_GENES,
    {
      variables: {
        assembly: assembly.toLowerCase(),
        accessions: [accession],
        geneSearchChrom: region?.chrom,
        geneSearchStart: region?.start - 1000000,
        geneSearchEnd: region?.end + 1000000,
        geneVersion: assembly.toLowerCase() === "grch38" ? 40 : 25,
      },
      skip: !region,
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-first",
    }
  );

  const {
    data: otherComputationalLinkedGenes,
    loading: loadingOtherComputationalLinkedGenes,
  } = useQuery<ComputationalGeneLinksQuery, ComputationalGeneLinksQueryVariables>(ComputationalGeneLinks_Query, {
    variables: { accession: accession },
    skip: !accession,
  });

  //Find distance to nearest TSS for each nearby gene, and only keep the closest 3
  const nearest3AndLinkedGenes: NearbyWithDistanceAndLinked = useMemo(() => {
    return dataNearbyAndLinked && otherComputationalLinkedGenes
      ? {
          //remove trailing space in return data
          linkedGenes: [
            ...dataNearbyAndLinked.linkedGenes.map((g) => {
              return { ...g, gene: g.gene.split(" ")[0] };
            }),
          ],
          nearbyGenes: [
            ...dataNearbyAndLinked.nearbyGenes.map((gene) => {
              return {
                ...gene,
                distanceToTSS: calcDistToTSS(
                  region,
                  gene.transcripts,
                  gene.strand
                ),
              };
            }),
          ]
            .sort((a, b) => a.distanceToTSS - b.distanceToTSS)
            .slice(0, 3),
          otherComputationalLinkedGenes:
            otherComputationalLinkedGenes["ComputationalGeneLinksQuery"],
        }
      : null;
  }, [dataNearbyAndLinked, otherComputationalLinkedGenes, region]);

  //Used to pass genes and their linking method to Gene Expression and RAMPAGE pages
  const uniqueGenes: { name: string; linkedBy: string[] }[] = useMemo(() => {
    const uniqueGenes: { name: string; linkedBy: string[] }[] = [];
    if (nearest3AndLinkedGenes) {
      for (const gene of [
        ...nearest3AndLinkedGenes.nearbyGenes,
        ...nearest3AndLinkedGenes.linkedGenes,
        ...nearest3AndLinkedGenes.otherComputationalLinkedGenes,
      ]) {
        const isNearbyGene: boolean = Object.hasOwn(gene, "distanceToTSS");
        let geneName: string;
        let methodToPush: string;
        if (isNearbyGene) {
          geneName = (gene as NearbyGeneInfoWithDistance).name;
          methodToPush = `Distance to TSS - ${(
            gene as NearbyGeneInfoWithDistance
          ).distanceToTSS.toLocaleString()} bp`;
        } else {
          geneName = (
            gene as
              | LinkedGeneInfo
              | ComputationalGeneLinksQuery["ComputationalGeneLinksQuery"][number]
          ).gene;
          methodToPush =
            //bad but whatever. This all will be refactored in redesign
            (gene as any)?.assay ?? (gene as any)?.method;
        }
        const existingGeneEntry = uniqueGenes.find(
          (uniqueGene) => uniqueGene.name === geneName
        );
        if (
          existingGeneEntry &&
          !existingGeneEntry.linkedBy.some((method) => method === methodToPush)
        ) {
          //add linking method if duplicate doesn't exist
          existingGeneEntry.linkedBy.push(methodToPush);
        } else if (!existingGeneEntry)
          uniqueGenes.push({ name: geneName, linkedBy: [methodToPush] });
      }
    }
    return uniqueGenes;
  }, [nearest3AndLinkedGenes]);

  return region ? (
    <>
      <Stack
        direction="row"
        justifyContent={"space-between"}
        alignItems={"baseline"}
      >
        <Typography variant="h4">{accession}</Typography>
        <Typography variant="h6">{`${
          region.chrom
        }:${region.start.toLocaleString("en-US")}-${region.end.toLocaleString(
          "en-US"
        )}`}</Typography>
      </Stack>
      <Divider sx={{ mb: 2 }} />
      {page === 0 && nearest3AndLinkedGenes && (
        <InSpecificBiosamples
          accession={accession}
          assembly={assembly}
          distanceToTSS={
            nearest3AndLinkedGenes.nearbyGenes.sort(
              (a, b) => a.distanceToTSS - b.distanceToTSS
            )[0].distanceToTSS
          }
        />
      )}
      {page === 1 &&
        assembly !== "mm10" &&
        (loadingLinkedGenes || loadingOtherComputationalLinkedGenes ? (
          <CircularProgress />
        ) : errorNearbyAndLinked ? (
          <Typography>{`Issue fetching Linked Genes for ${accession}.`}</Typography>
        ) : (
          <LinkedGenes
            linkedGenes={nearest3AndLinkedGenes?.linkedGenes || []}
            assembly={assembly}
            accession={accession}
          />
        ))}
      {page === 2 && (
        <FunctionData
          accession={accession}
          coordinates={{
            chromosome: region.chrom,
            start: region.start,
            end: region.end,
          }}
          assembly={assembly}
        />
      )}
      {page === 3 && assembly !== "mm10" && <Silencers accession={accession} />}
      {page === 4 && (
        <NearByGenomicFeatures
          accession={accession}
          assembly={assembly}
          coordinates={{
            chromosome: region.chrom,
            start: +region.start,
            end: +region.end,
          }}
          handleOpencCRE={handleOpencCRE}
        />
      )}
      {page === 5 && <Ortholog accession={accession} assembly={assembly} />}
      {page === 6 &&
        (loadingLinkedGenes || loadingOtherComputationalLinkedGenes ? (
          <CircularProgress />
        ) : errorNearbyAndLinked ? (
          <Typography>{`Issue fetching Linked Genes for ${accession}. Please use our Gene Expression Applet`}</Typography>
        ) : (
          <GeneExpression assembly={assembly} genes={uniqueGenes} />
        ))}

      {page === 7 &&
        assembly !== "mm10" &&
        (!dataNearbyAndLinked ||
        loadingLinkedGenes ||
        loadingOtherComputationalLinkedGenes ? (
          <CircularProgress />
        ) : errorNearbyAndLinked ? (
          <Typography>{`Issue fetching Linked Genes for ${accession}.`}</Typography>
        ) : (
          <Rampage genes={uniqueGenes} />
        ))}
      {page === 8 && (
        <>
          <TfSequenceFeatures
            assembly={assembly}
            coordinates={{
              chromosome: region.chrom,
              start: region.start,
              end: region.end,
            }}
          />
          <TfIntersection
            assembly={assembly}
            coordinates={{
              chromosome: region.chrom,
              start: region.start,
              end: region.end,
            }}
          />
        </>
      )}
      {page === 9 && assembly !== "mm10" && (
        <ChromHMM
          coordinates={{
            chromosome: region.chrom,
            start: region.start,
            end: region.end,
          }}
        />
      )}
      {page === 10 && (
        <ConfigureGBTab
          coordinates={{
            assembly: assembly,
            chromosome: region.chrom,
            start: region.start,
            end: region.end,
          }}
          accession={accession}
        />
      )}

      {page === 11 && assembly !== "mm10" && (
        <ENTExData
          accession={accession}
          coordinates={{
            chromosome: region.chrom,
            start: region.start,
            end: region.end,
          }}
        />
      )}
    </>
  ) : (
    <LoadingMessage />
  );
};
