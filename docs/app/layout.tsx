import { Footer, Layout, Link, Navbar } from 'nextra-theme-docs'
import { Banner, Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import './globals.css'
import { Metadata } from "next";
import { NextraSearchDialog } from "@/components/nextra-search-dialog";
import { getPagesFromPageMap } from "@/lib/getPagesFromPageMap";

export const metadata: Metadata = {
}

const banner = <Banner storageKey="some-key">This template was created with 🩸 and 💦 by <Link href="">PHUCBM</Link> 🐧</Banner>
const navbar = (
    <Navbar
        projectLink="https://github.com/0xhappyboy/candleview"
        logo={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img
                    src="https://raw.githubusercontent.com/0xhappyboy/candleview/main/assets/logo/logo_100x100.jpeg"
                    alt="Logo"
                    width={35}
                    height={35}
                    style={{ borderRadius: '5px' }}
                />
                <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                    CandleView
                </span>
            </div>
        }
    />
)
const footer = <Footer>MIT {new Date().getFullYear()} © Nextra.</Footer>

export default async function RootLayout({ children }) {
    const pageMap = await getPageMap();
    const pages = await getPagesFromPageMap({
        pageMapArray: pageMap,
        // filterItem: async (item) => {
        //     return {
        //         ...item,
        //     };
        // }
    });

    return (
        <html
            lang="en"
            dir="ltr"
            suppressHydrationWarning
        >
            <Head
            >
                <link rel="shortcut icon" href="https://raw.githubusercontent.com/0xhappyboy/candleview/main/assets/logo/logo_100x100.jpeg" />
            </Head>
            <body>
                <Layout
                    banner={banner}
                    navbar={navbar}
                    pageMap={pageMap}
                    footer={footer}
                    search={<NextraSearchDialog pages={pages} />}
                >
                    {children}
                </Layout>
            </body>
        </html>
    )
}