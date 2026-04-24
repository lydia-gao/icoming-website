import { placeholder, type Credential } from "./_types";

/**
 * TRUST / CREDENTIALS CONTENT
 * ---------------------------
 * Only real documents are listed with images. Anything else is a
 * placeholder prompting the business team to upload the real doc.
 */

export const trustContent = {
  credentials: [
    {
      title: "SGS Supplier Assessment Certificate",
      subtitle: "On-site assessment by SGS via Alibaba.com",
      image: "/images/trust/sgs-supplier-assessment-cert.png",
      imageAlt:
        "Supplier Assessment Certificate issued to Pingyang ICom Bag Co., Ltd. by SGS, 2018–2019",
      issuer: "SGS / Alibaba",
      validity: placeholder(
        "Current validity",
        "The certificate on file is dated 2018–2019. Confirm whether this has been renewed and upload the latest version.",
      ).needs,
    },
    {
      title: "Alibaba.com Assessed Supplier Report",
      subtitle: "Company overview and production capacity report",
      image: "/images/trust/alibaba-assessed-supplier-report.png",
      imageAlt: "Alibaba.com Assessed Supplier report for Pingyang ICom Bag Co., Ltd.",
      issuer: "SGS / Alibaba",
    },
    placeholder(
      "BSCI audit",
      "If you're BSCI-audited, upload the latest audit report PDF/image to /public/images/trust/bsci-audit.png and add it here.",
    ),
    placeholder(
      "REACH / Prop 65 test report",
      "Upload the most recent test report(s) showing compliance with EU REACH and/or California Prop 65.",
    ),
    placeholder(
      "Material certifications",
      "If you supply GOTS organic cotton, OEKO-TEX 100 fabrics, or FSC paper, upload the corresponding certificates.",
    ),
    placeholder(
      "ISO / quality-system certs",
      "If you hold ISO 9001 or equivalent, upload the certificate.",
    ),
  ] satisfies Credential[],
};
