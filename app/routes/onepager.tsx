import { exampleCompanyData, generateHTML } from "@/lib/onePager";

import { useLoaderData } from "@remix-run/react";

export default function OnePager() {
  const { fullHtml } = useLoaderData<typeof loader>();
  return (
    <div className="max-w-8xl mx-auto  min-h-screen p-12">
      <div dangerouslySetInnerHTML={{ __html: fullHtml }} />
    </div>
  );
}

export async function loader() {
  const fullHtml = await generateHTML(exampleCompanyData);
  return Response.json({ fullHtml });
}
