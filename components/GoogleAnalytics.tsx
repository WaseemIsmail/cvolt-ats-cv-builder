import Script from "next/script";
const ID = "G-YKELEQQ441";
export default function GoogleAnalytics() {
  const setup = "window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('config','" + ID + "',{anonymize_ip:true});";
  return <><Script src={"https://www.googletagmanager.com/gtag/js?id=" + ID} strategy="afterInteractive"/><Script id="google-analytics" strategy="afterInteractive" dangerouslySetInnerHTML={{__html:setup}}/></>;
}