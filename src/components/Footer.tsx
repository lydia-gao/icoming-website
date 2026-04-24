import Link from "next/link";
import { localizedCompany } from "@/data/company";
import { getLocalizedCategories } from "@/data/categories";
import { uiContent } from "@/content/ui";
import { localePath, type Locale } from "@/lib/i18n";

export function Footer({ locale }: { locale: Locale }) {
  const company = localizedCompany(locale);
  const topCategories = getLocalizedCategories(locale).slice(0, 8);
  const ui = uiContent[locale].footer;

  return (
    <footer className="mt-24 border-t border-ink-100 bg-ink-900 text-ink-100">
      <div className="container-content grid gap-10 py-14 md:grid-cols-12">
        <div className="md:col-span-4">
          <div className="font-serif text-2xl font-semibold text-white">{company.brand}</div>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-100/70">
            {company.legalName}. {company.tagline}
          </p>
          <div className="mt-6 space-y-1 text-sm text-ink-100/70">
            <div>
              <a className="hover:text-white" href={`mailto:${company.contact.primaryEmail}`}>
                {company.contact.primaryEmail}
              </a>
            </div>
            <div>
              <a className="hover:text-white" href={`tel:${company.contact.phone.replace(/[^+\d]/g, "")}`}>
                {company.contact.phone}
              </a>
            </div>
            <div className="pt-2 text-ink-100/60">
              {company.contact.address.line1}, {company.contact.address.line2},{" "}
              {company.contact.address.region}
            </div>
          </div>
        </div>

        <div className="md:col-span-3">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-100/50">
            {ui.companyColumn}
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link className="hover:text-white" href={localePath(locale, "/about")}>{ui.nav.about}</Link></li>
            <li><Link className="hover:text-white" href={localePath(locale, "/capabilities")}>{ui.nav.capabilities}</Link></li>
            <li><Link className="hover:text-white" href={localePath(locale, "/contact")}>{ui.nav.contact}</Link></li>
            <li><Link className="hover:text-white" href={localePath(locale, "/inquiry")}>{ui.nav.inquiryBasket}</Link></li>
          </ul>
        </div>

        <div className="md:col-span-5">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-100/50">
            {ui.popularCategoriesColumn}
          </div>
          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {topCategories.map((c) => (
              <li key={c.slug}>
                <Link className="hover:text-white" href={localePath(locale, `/categories/${c.slug}`)}>
                  {c.name}
                </Link>
              </li>
            ))}
            <li className="col-span-2 pt-2">
              <Link className="text-moss-300 hover:text-white" href={localePath(locale, "/products")}>
                {ui.seeAllProducts}
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-content flex flex-col gap-3 py-5 text-xs text-ink-100/50 md:flex-row md:items-center md:justify-between">
          <div>© {new Date().getFullYear()} {company.legalName}. {ui.allRightsReserved}</div>
          <div className="flex gap-4">
            <a className="hover:text-white" href={company.social.facebook} target="_blank" rel="noopener">Facebook</a>
            <a className="hover:text-white" href={company.social.youtube} target="_blank" rel="noopener">YouTube</a>
            <a className="hover:text-white" href={company.social.pinterest} target="_blank" rel="noopener">Pinterest</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
