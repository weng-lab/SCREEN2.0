/*
 * SPDX-License-Identifier: MIT
 * Copyright (c) 2016-2020 Michael Purcaro, Henry Pratt, Jill Moore, Zhiping Weng
 */

import React from "react"

import * as Para from "./tab_about_paragraphs"
// import { tabPanelize } from "../../../common/utility"

class TabAbout extends React.Component {
  // constructor(props) {
  //   super(props)
  //   this.key = "about"
  // }

  // shouldComponentUpdate(nextProps, nextState) {
  //   return this.key === nextProps.maintabs_active
  // }

  render() {
    // if (this.key !== this.props.maintabs_active) {
    //   return false
    // }
    let content = (
      <div>
        <div className="row">
          <div className="col-md-12">
            <h3>The ENCODE Encyclopedia</h3>
            {Para.figure(1, "ENCODE data levels", { maxHeight: "500px" })}
          </div>
          <div className="col-md-12">
            <br />
            {Para.intro()}
          </div>
        </div>
        <div className="row">
          <div className="col-md-6">
            <h3>The Registry of cCREs</h3>
          </div>
        </div>
        <div className="row">
          <div className="col-md-6">
            {Para.registry1()}
            <h4>Defining high epigenomic signals</h4>
            {Para.registry2()}
            {Para.registry3()}
          </div>
          <div className="col-md-6">{Para.figure(2, "classification flowchart")}</div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <h3>Classification of cCREs</h3>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            {Para.classif1()}
            {Para.classif2()}
            {Para.classif3()}
            {Para.classif4()}
          </div>
        </div>
        <div className="row">
          <div className="col-md-10">{Para.figure(3, "GM12878 cCRE classifications")}</div>
        </div>
        <div className="row">
          <div className="col-md-7">
            <h3>Genomic Footprint of the cCREs</h3>
          </div>
        </div>
        <div className="row">
          <div className="col-md-6">{Para.genomicFootprint()}</div>
          <div className="col-md-6">{Para.figure(4, "genomic coverage")}</div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <h3>Additional properties of cCREs</h3>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">{Para.additionalProperties()}</div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <h3>Integration with ground level annotations</h3>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">{Para.groundLevel()}</div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <h3>Using cCREs to Interpret GWAS Variants</h3>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <h4>Curating GWAS Results</h4>
            {Para.gwas1()}
            <h4>Determining Cell Types with cCREs Enriched in GWAS SNPs</h4>
            {Para.gwas2()}
            {Para.gwas3()}
          </div>
        </div>
        <div className="row">
          <div className="col-md-10">{Para.figure(5, "trait cCRE enrichment")}</div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <h3>How to Cite the ENCODE Encyclopedia, the Registry of cCREs, and SCREEN</h3>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">{Para.citation()}</div>
        </div>
      </div>
    )

    return <div>{content}</div>
  }
}

export default TabAbout
