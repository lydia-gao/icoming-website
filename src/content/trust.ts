import type { Locale } from "@/lib/i18n";
import { placeholder, type Credential } from "./_types";

/**
 * TRUST / CREDENTIALS CONTENT — bilingual
 */

const en = {
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
      imageAlt:
        "Alibaba.com Assessed Supplier report for Pingyang ICom Bag Co., Ltd.",
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

const zh: typeof en = {
  credentials: [
    {
      title: "SGS 供应商评估证书",
      subtitle: "由 SGS 通过阿里巴巴进行的实地评估",
      image: "/images/trust/sgs-supplier-assessment-cert.png",
      imageAlt: "SGS 颁发给平阳爱康箱包有限公司的供应商评估证书(2018–2019)",
      issuer: "SGS / 阿里巴巴",
      validity: placeholder(
        "当前有效期",
        "在档证书为 2018–2019 年版本。请确认是否已续签,并上传最新版本。",
      ).needs,
    },
    {
      title: "阿里巴巴认证供应商报告",
      subtitle: "公司概况与产能报告",
      image: "/images/trust/alibaba-assessed-supplier-report.png",
      imageAlt: "平阳爱康箱包有限公司的阿里巴巴认证供应商报告",
      issuer: "SGS / 阿里巴巴",
    },
    placeholder(
      "BSCI 审核",
      "如已通过 BSCI 审核,请将最新审核报告(PDF/图片)上传至 /public/images/trust/bsci-audit.png 并在此处添加。",
    ),
    placeholder(
      "REACH / Prop 65 测试报告",
      "请上传符合欧盟 REACH 及/或加州 Prop 65 的最新测试报告。",
    ),
    placeholder(
      "材料认证",
      "如供应 GOTS 有机棉、OEKO-TEX 100 面料或 FSC 纸张,请上传对应证书。",
    ),
    placeholder(
      "ISO / 质量体系认证",
      "如持有 ISO 9001 或同等认证,请上传证书。",
    ),
  ] satisfies Credential[],
};

export const trustContent: Record<Locale, typeof en> = { en, zh };
