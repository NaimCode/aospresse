import { NextPageContext } from "next";
import Document, {
    Html,
    Main,
    NextScript,
    Head,
    DocumentContext,
} from "next/document";

class MyDocument extends Document {


    render() {
        return (
            <Html
                dir={"rtl"}
                lang={"ar"}
            >
                <Head>

                </Head>
                <body>
                <Main />
                <NextScript />
                </body>
            </Html>
        );
    }
}

export default MyDocument;
