import { cCREData, MainQueryParams } from "../../app/search/types"

  /**
   * 
   * @param input string
   * @returns true if string === 't', else false
   */
  export function checkTrueFalse(input: string): boolean{
    if (input == 't') { return true }
    else { return false }
  }

  /**
   * 
   * @param input boolean
   * @returns 't' if true, else 'f'
   */
  export function outputT_or_F(input: boolean): "t" | "f" {
    if (input === true) { return 't' }
    else return 'f'
  }

  /**
   * 
   * @param currentElement the cCRE to check
   * @param biosample the selected b
   * @param mainQueryParams 
   * @returns 
   */
  export function passesCriteria(currentElement: cCREData, biosample: string | null, mainQueryParams: MainQueryParams): boolean {
    if ((passesChromatinFilter(currentElement, biosample, mainQueryParams)) && passesClassificationFilter(currentElement, mainQueryParams)) {
      return true
    }
    else return false
  }

  function passesChromatinFilter(currentElement: cCREData, biosample: string | null, mainQueryParams: MainQueryParams) {
    const dnase = biosample ? currentElement.ctspecific.dnase_zscore : currentElement.dnase_zscore
    const h3k4me3= biosample ? currentElement.ctspecific.h3k4me3_zscore : currentElement.promoter_zscore
    const h3k27ac= biosample ? currentElement.ctspecific.h3k27ac_zscore : currentElement.enhancer_zscore
    const ctcf= biosample ? currentElement.ctspecific.ctcf_zscore : currentElement.ctcf_zscore
    if (
      mainQueryParams.dnase_s < dnase &&
        dnase < mainQueryParams.dnase_e &&
      mainQueryParams.h3k4me3_s < h3k4me3 &&
        h3k4me3 < mainQueryParams.h3k4me3_e &&
      mainQueryParams.h3k27ac_s < h3k27ac &&
        h3k27ac < mainQueryParams.h3k27ac_e &&
      mainQueryParams.ctcf_s < ctcf &&
        ctcf < mainQueryParams.ctcf_e
    ) { return true }
    else return false
  }

  //Consider changing this to a switch, might be slightly faster and would be cleaner.
  function passesClassificationFilter(currentElement: cCREData, mainQueryParams: MainQueryParams){
    const currentElementClass: string = currentElement.pct
    if (currentElementClass === "CA") {
      if (mainQueryParams.CA === true) {
        return true
      }
      else return false
    }
    else if (currentElementClass === "CA-CTCF") {
      if (mainQueryParams.CA_CTCF === true) {
        return true
      }
      else return false
    }
    else if (currentElementClass === "CA-H3K4me3") {
      if (mainQueryParams.CA_H3K4me3 === true) {
        return true
      }
      else return false
    }
    else if (currentElementClass === "CA-TF") {
      if (mainQueryParams.CA_TF === true) {
        return true
      }
      else return false
    }
    else if (currentElementClass === "dELS") {
      if (mainQueryParams.dELS === true) {
        return true
      }
      else return false
    }
    else if (currentElementClass === "pELS") {
      if (mainQueryParams.pELS === true) {
        return true
      }
      else return false
    }
    else if (currentElementClass === "PLS") {
      if (mainQueryParams.PLS === true) {
        return true
      }
      else return false
    }
    else if (currentElementClass === "TF") {
      if (mainQueryParams.TF === true) {
        return true
      }
      else return false
    }
    else {
      console.log("Something went wrong, cCRE class not determined!")
      return false
    }
  }