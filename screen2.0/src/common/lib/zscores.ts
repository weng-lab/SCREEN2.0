import { SCREENCellTypeSpecificResponse } from "../../app/search/types"

/**
 * One experiment row inside the `zscores` JSON array returned by `getcCREZScoresQuery`.
 * The tuple is positional; the indices are documented below. `Details` is `string` when the
 * query was run with `include_biosample_details: true`, otherwise `null`.
 */
export type ZScoresEntry<Details extends string | null = string | null> = [
  string,              // 0 experiment_accession
  string,              // 1 file_accession
  string,              // 2 assay
  string,              // 3 biosample name
  Details,             // 4 biosample displayname
  Details,             // 5 ontology
  Details,             // 6 sample_type
  Details,             // 7 lifestage
  number,              // 8 score
  "yes" | "no" | "na", // 9 tf
];

/**
 * Parse the positional `zscores` array for a single cCRE into a keyed
 * SCREENCellTypeSpecificResponse. Returns a fresh object on every call.
 */
export const parseZScoresArray = (zScoresArray: ZScoresEntry<null>[]): SCREENCellTypeSpecificResponse => {
  const zScoresAndCt: SCREENCellTypeSpecificResponse = {
    ct: zScoresArray[0][3],
    dnase_zscore: null,
    h3k4me3_zscore: null,
    h3k27ac_zscore: null,
    ctcf_zscore: null,
    atac_zscore: null,
  }

  zScoresArray.forEach((experiment) => {
    const assay = experiment[2];
    const score = experiment[8];
    switch (assay) {
      case "DNase":
        zScoresAndCt.dnase_zscore = score;
        break;
      case "H3K4me3":
        zScoresAndCt.h3k4me3_zscore = score;
        break;
      case "H3K27ac":
        zScoresAndCt.h3k27ac_zscore = score;
        break;
      case "CTCF":
        zScoresAndCt.ctcf_zscore = score;
        break;
      case "ATAC":
        zScoresAndCt.atac_zscore = score;
        break;
    }
  });
  return zScoresAndCt
};
