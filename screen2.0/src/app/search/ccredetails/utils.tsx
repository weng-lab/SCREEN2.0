export const z_score = (d) => (d === -11.0 || d === "--" || d === undefined ? "--" : d.toFixed(2))

export const ctgroup = (group: string) => {
    group = group.split(",")[0]
    if (group === "CA-CTCF")
      return (
        <span style={{ color: "#00B0F0" }}>
          <strong>chromatin accessible with ctcf</strong>
        </span>
      )
    if (group === "CA-TF")
      return (
        <span style={{ color: "#be28e5" }}>
          <strong>chromatin accessible with tf</strong>
        </span>
      )
    if (group === "CA-H3K4me3")
      return (
        <span style={{ color: "#ffaaaa" }}>
          <strong>chromatin accessible with H3K4me3</strong>
        </span>
      )
    if (group === "TF")
      return (
        <span style={{ color: "#d876ec" }}>
          <strong>tf only</strong>
        </span>
      )
    if (group === "CA")
      return (
        <span style={{ color: "#06DA93" }}>
          <strong>chromatin accessible only</strong>
        </span>
      )
    if (group === "pELS")
      return (
        <span style={{ color: "#ffcd00" }}>
          <strong>proximal enhancer-like signature</strong>
        </span>
      )
    if (group === "dELS")
      return (
        <span style={{ color: "#ffcd00" }}>
          <strong>distal enhancer-like signature</strong>
        </span>
      )
    if (group === "PLS")
      return (
        <span style={{ color: "#ff0000" }}>
          <strong>promoter-like signature</strong>
        </span>
      )
    if (group === "DNase-H3K4me3")
      return (
        <span style={{ color: "#ffaaaa" }}>
          <strong>DNase-H3K4me3</strong>
        </span>
      )
    if (group === "ctcf")
      return (
        <span style={{ color: "#00b0f0" }}>
          <strong>CTCF bound</strong>
        </span>
      )
    if (group === "ylowdnase")
      return (
        <span style={{ color: "#8c8c8c" }}>
          <strong>low DNase</strong>
        </span>
      )
    if (group === "zunclassified")
      return (
        <span style={{ color: "#8c8c8c" }}>
          <strong>zunclassified</strong>
        </span>
      )
    return (
      <span style={{ color: "#06da93" }}>
        <strong>DNase only</strong>
      </span>
    )
  }