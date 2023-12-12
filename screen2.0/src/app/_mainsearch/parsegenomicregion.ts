//Helpers for the Search components

/**
 * 
 * @param input A user-entered string representing a genomic region; chr_:start-end or tab separated format supported
 * @returns an object containing chromosome, start, and end (strings)
 */
export function parseGenomicRegion(input: string): { chromosome: string, start: string, end: string } {
  let inputArr: string[]
  let chromosome: string
  let coordinates: string[]
  let start: string
  let end: string
  //This is the tab character. If input contains tab character...
  if (input.includes("	")) {
    inputArr = input.split("	")
    chromosome = inputArr[0]
    start = inputArr[1].replace(new RegExp(',', 'g'), "")
    end = inputArr[2].replace(new RegExp(',', 'g'), "")
  }
  //Else assume it's the chr:start-end format
  else {
    inputArr = input.split(":")
    chromosome = inputArr[0]
    coordinates = inputArr[1].split("-")
    start = coordinates[0].replace(new RegExp(',', 'g'), "")
    end = coordinates[1].replace(new RegExp(',', 'g'), "")
  }

  return { chromosome, start, end }
}