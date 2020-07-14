import { NowRequest, NowResponse } from "@vercel/node";
import { renderToString } from "react-dom/server";
import { decode } from "querystring";
import TextWriter, { FontConfig } from "../components/Typewritter";

export interface Params {
    strings?: string;   //encode
  }

export default async function (req: NowRequest, res: NowResponse) {
  const params = decode(req.url.split("?")[1]) as Params;

  if (!params || typeof params.strings === "undefined") {
    return res.status(200).end();
  }

  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "s-maxage=1, stale-while-revalidate");

  const array = JSON.parse(decodeURIComponent(params.strings));
  const font: FontConfig = {
    color: '#111',
    family: 'Helvetica Neue',
    weight: '600',
    size: 70
  }

  const text = renderToString(
    TextWriter({ strings: array, font: font })
  );
  return res.status(200).send(text);
}
