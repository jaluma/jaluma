import { NowRequest, NowResponse } from "@vercel/node";
import { renderToString } from "react-dom/server";
import { decode } from "querystring";
import { FontConfig } from "../components/Typewritter";
import { HeaderBanner } from "../components/HeaderBanner";

export interface Params {
    strings?: string;   //JSON and encode
  }

export default async function (req: NowRequest, res: NowResponse) {
  const params = decode(req.url.split("?")[1]) as Params;

  if (!params || typeof params.strings === "undefined") {
    return res.status(400).end();
  }

  const array = JSON.parse(decodeURIComponent(params.strings));
  const font: FontConfig = {
    color: '#111',
    family: 'Helvetica Neue',
    weight: 600,
    size: 70
  }

  const text = renderToString(
    HeaderBanner({ strings: array, width: '100%', height: '30%', font: font })
  );
  return res.status(200).send(text);
}
