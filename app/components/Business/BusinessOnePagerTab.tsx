import { useEffect, useState } from "react";
import {
  UserSearch,
  LoaderCircle,
  Plus,
  Trash2,
  X,
  FileText,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Copy, Edit, Check } from "lucide-react";
import {
  BusinessData,
  FundingRound,
  PeriodFinancialsSchemaType,
  TeamMember,
} from "@/lib/typesCompany";
import { Label } from "@/components/ui/label";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Textarea } from "@/components/ui/textarea";
import { Link, useFetcher } from "@remix-run/react";
import { Input } from "../ui/input";

const TOAST_DURATION = 3000;

export function BusinessOnePager({
  company,
  webProfile,
  profileId,
  editor,
}: {
  company: BusinessData;
  webProfile: BusinessData;
  privateProfile: BusinessData;
  profileId: string;
  editor: string;
}) {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [funding, setFunding] = useState<FundingRound[]>([]);

  // Editing states
  const [basicInfoOverviewEditable, setBasicInfoOverviewEditable] =
    useState(false);
  const [productsEditable, setProductsEditable] = useState(false);
  const [teamEditable, setTeamEditable] = useState(false);
  const [kpisEditable, setKpisEditable] = useState(false);
  const [fundingEditable, setFundingEditable] = useState(false);
  const [dealEditable, setDealEditable] = useState(false);

  const fetcher = useFetcher();

  useEffect(() => {
    if (company.teamInfo) {
      if (company.teamInfo?.leadership) {
        setTeam(
          company?.teamInfo?.leadership?.length > 0
            ? company.teamInfo?.leadership
            : [],
        );
      }
    }
    if (
      company?.ownershipInfo &&
      company?.ownershipInfo.fundingHistory?.rounds
    ) {
      setFunding(company?.ownershipInfo?.fundingHistory?.rounds || []);
    }
  }, [company, webProfile]);

  const recentFinancials =
    company?.financials?.historical?.length &&
    company?.financials?.historical?.length > 0
      ? company?.financials?.historical?.sort(
          (a: PeriodFinancialsSchemaType, b: PeriodFinancialsSchemaType) =>
            (b.period?.year || 0) - (a.period?.year || 0),
        )[0]
      : null;

  const latestFinancials = company?.financials?.latest;

  const teamSize = company.teamInfo
    ? company.teamInfo?.teamSize
    : webProfile.teamInfo?.teamSize;

  const handleEditable = async (
    e: React.FormEvent<HTMLFormElement>,
    callback: () => void,
  ) => {
    e.preventDefault();
    toast("Saving", { duration: TOAST_DURATION });
    await fetcher.submit(e.target as HTMLFormElement, {
      method: "post",
      action: "/api/business/edit",
    });
    callback();
  };

  const handleOnePagerButton = async (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();
    const response = await fetch(`/api/doc/onepager/create/${profileId}`);
    const data = await response.blob();
    const url = URL.createObjectURL(data);
    window.open(url, "_blank");
    // if (data.onePagerUrl) {
    //   window.open(data.onePagerUrl, "_blank");
    // } else {
    //   toast("Error creating one pager", { duration: TOAST_DURATION });
    // }
  };
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="flex flex-col gap-6">
        {/* Business Overview */}
        <Card>
          <fetcher.Form
            method="post"
            onSubmit={(e) =>
              handleEditable(e, () => setBasicInfoOverviewEditable(false))
            }
            action="/api/business/edit"
          >
            <input type="hidden" name="profileId" value={profileId} />
            <Toaster />
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex justify-between items-center">
                <div>Business Overview</div>
                <div className="flex items-center gap-0">
                  <Link
                    to={`/api/doc/onepager/create/${profileId}/onepager.pptx`}
                    target="_blank"
                    rel="noopener noreferrer"
                    download="onepager.pptx"
                    reloadDocument
                  >
                    <Button variant="outline" type="button">
                      <FileText className="h-4 w-4" />
                      <div>One Pager</div>
                    </Button>
                  </Link>

                  <Button
                    variant="ghost"
                    className={basicInfoOverviewEditable ? "hidden" : ""}
                    onClick={() => {
                      const content = company.basicInfo?.overview || "...";
                      navigator.clipboard.writeText(content);
                      toast("Copied to clipboard!", {
                        duration: TOAST_DURATION,
                      });
                    }}
                  >
                    <Copy className="h-4 w-4" />
                    <div>Copy</div>
                  </Button>
                  {!basicInfoOverviewEditable ? (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setBasicInfoOverviewEditable(true);
                      }}
                      type="button"
                    >
                      <Edit className="h-4 w-4" />
                      <div>Edit</div>
                    </Button>
                  ) : (
                    <>
                      <Button
                        disabled={fetcher.state === "submitting"}
                        type="submit"
                        name="action"
                        value="overview"
                      >
                        {fetcher.state === "submitting" ? (
                          <LoaderCircle className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                        <div>
                          {fetcher.state === "submitting"
                            ? "Saving..."
                            : "Save"}
                        </div>
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={(e) => {
                          e.preventDefault();
                          setBasicInfoOverviewEditable(false);
                          toast("Changes discarded", {
                            duration: TOAST_DURATION,
                          });
                        }}
                        type="button"
                        className="ml-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pl-3 pr-3">
              <Textarea
                name="overview"
                isEditable={basicInfoOverviewEditable}
                defaultValue={company.basicInfo?.overview || "..."}
                className="w-full min-h-[100px] p-2 disabled:text-gray-900"
              />
            </CardContent>
            <input type="hidden" name="action" value="overview" />
          </fetcher.Form>
        </Card>

        {/* Product */}
        <Card>
          <fetcher.Form
            method="post"
            onSubmit={(e) =>
              handleEditable(e, () => setProductsEditable(false))
            }
            action="/api/business/edit"
          >
            <input type="hidden" name="profileId" value={profileId} />
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex justify-between items-center">
                <div>Product</div>
                <div className="flex items-center gap-0">
                  {!productsEditable ? (
                    <>
                      <Button
                        variant="outline"
                        className="border-none shadow-none"
                        onClick={() => {
                          const content = [
                            "Category,Value",
                            `Target Market,${company.productInfo?.targetMarket?.market || "..."}`,
                            `Competitive Advantage,${company.basicInfo?.competitiveAdvantage || "..."}`,
                            `Pricing Model,${company.productInfo?.businessModel?.pricing || "..."}`,
                            `Fee Structure,${company.productInfo?.businessModel?.feeStructure || "..."}`,
                            `Go to market,${company.productInfo?.gtmStrategy?.strategy || "..."}`,
                            `Competition,${company.productInfo?.competition?.competitors?.join("; ") || "..."}`,
                          ].join("\n");
                          navigator.clipboard.writeText(content);
                          toast("Copied to clipboard!", {
                            duration: TOAST_DURATION,
                          });
                        }}
                        type="button"
                      >
                        <Copy className="h-4 w-4" />
                        <div>Copy</div>
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setProductsEditable(true);
                        }}
                        type="button"
                      >
                        <Edit className="h-4 w-4" />
                        <div>Edit</div>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        disabled={fetcher.state === "submitting"}
                        type="submit"
                        name="action"
                        value="products"
                      >
                        {fetcher.state === "submitting" ? (
                          <LoaderCircle className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                        <div>
                          {fetcher.state === "submitting"
                            ? "Saving..."
                            : "Save"}
                        </div>
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={(e) => {
                          e.preventDefault();
                          setProductsEditable(false);
                          toast("Changes discarded", {
                            duration: TOAST_DURATION,
                          });
                        }}
                        type="button"
                        className="ml-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col space-y-2">
                <div className="flex">
                  <Label className="min-w-[185px] self-center">
                    Target Market
                  </Label>
                  <input type="hidden" name="action" value="products" />
                  <input
                    type="hidden"
                    name="source"
                    value={JSON.stringify({
                      name: editor,
                      url: "manual",
                      details: "Manual editing at " + new Date().toISOString(),
                    })}
                  />
                  <Input
                    isEditable={productsEditable}
                    name="targetMarket"
                    className="text-gray-600 border-none shadow-none"
                    defaultValue={
                      company.productInfo?.targetMarket?.market || "..."
                    }
                  />
                </div>
                <div className="flex">
                  <Label className="min-w-[185px] self-center">
                    Competitive Advantage
                  </Label>
                  <Input
                    isEditable={productsEditable}
                    name="competitiveAdvantage"
                    className="text-gray-600 border-none shadow-none"
                    defaultValue={
                      company.basicInfo?.competitiveAdvantage || "..."
                    }
                  />
                </div>
                <div className="flex">
                  <Label className="min-w-[185px] self-center">
                    Pricing Model
                  </Label>
                  <Input
                    isEditable={productsEditable}
                    name="pricingModel"
                    className="text-gray-600 border-none shadow-none"
                    defaultValue={
                      company.productInfo?.businessModel?.pricing || "..."
                    }
                  />
                </div>

                <div className="flex">
                  <Label className="min-w-[185px] self-center">
                    Fee Structure
                  </Label>
                  <Input
                    isEditable={productsEditable}
                    name="feeStructure"
                    className="text-gray-600 border-none shadow-none"
                    defaultValue={
                      company.productInfo?.businessModel?.feeStructure || "..."
                    }
                  />
                </div>
                <div className="flex">
                  <Label className="min-w-[185px] self-center">
                    Go to market
                  </Label>
                  <Input
                    isEditable={productsEditable}
                    name="gtm"
                    className="text-gray-600 border-none shadow-none"
                    defaultValue={
                      company.productInfo?.gtmStrategy?.strategy || "..."
                    }
                  />
                </div>
                <div className="flex">
                  <Label className="min-w-[185px] self-center">
                    Competition
                  </Label>
                  <Input
                    isEditable={productsEditable}
                    name="competition"
                    className="text-gray-600 border-none shadow-none"
                    defaultValue={
                      company.productInfo?.competition?.competitors?.join(
                        ", ",
                      ) || "..."
                    }
                  />
                </div>
              </div>
            </CardContent>
          </fetcher.Form>
        </Card>

        {/* Team */}
        <Card>
          <fetcher.Form
            method="post"
            onSubmit={(e) => handleEditable(e, () => setTeamEditable(false))}
            action="/api/business/edit"
          >
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex justify-between items-center">
                <div>Team</div>
                <div className="flex items-center gap-0">
                  {!teamEditable ? (
                    <>
                      <Button
                        variant="outline"
                        className="border-none shadow-none"
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          const content = [
                            "Name,Title,Background,LinkedIn",
                            ...team.map(
                              (item) =>
                                `${item.name || "..."},${item.title || "..."},${item.background || "..."},${item.linkedin || ""}`,
                            ),
                          ].join("\n");
                          navigator.clipboard.writeText(content);
                          toast("Copied to clipboard!", {
                            duration: TOAST_DURATION,
                          });
                        }}
                      >
                        <Copy className="h-4 w-4" />
                        <div>Copy</div>
                      </Button>

                      <Button
                        variant="ghost"
                        onClick={() => {
                          setTeamEditable(true);
                        }}
                        type="button"
                      >
                        <Edit className="h-4 w-4" />
                        <div>Edit</div>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        disabled={fetcher.state === "submitting"}
                        type="submit"
                        name="action"
                        value="team"
                      >
                        {fetcher.state === "submitting" ? (
                          <LoaderCircle className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                        <div>
                          {fetcher.state === "submitting"
                            ? "Saving..."
                            : "Save"}
                        </div>
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={(e) => {
                          e.preventDefault();
                          setTeamEditable(false);
                          toast("Changes discarded", {
                            duration: TOAST_DURATION,
                          });
                        }}
                        type="button"
                        className="ml-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pl-3 pr-2">
              <input type="hidden" name="teamSize" value={team.length} />
              <Table>
                <TableBody>
                  {team.map((item, index) => (
                    <TableRow>
                      <TableCell className="flex flex-row gap-3 items-start">
                        <Input
                          isEditable={teamEditable}
                          name={`team[${index}].name`}
                          className="text-gray-600 border-none shadow-none "
                          defaultValue={item.name || "..."}
                        />
                      </TableCell>
                      <TableCell>
                        {item.linkedin && (
                          <Link
                            to={item.linkedin || ""}
                            target="_blank"
                            className="text-blue-900 border-none shadow-none"
                          >
                            <UserSearch className="h-4 w-4 mt-2 ml-1" />
                          </Link>
                        )}
                        <input
                          type="hidden"
                          name={`team[${index}].linkedin`}
                          value={item.linkedin || ""}
                        />

                        <input
                          type="hidden"
                          name="source"
                          value={JSON.stringify({
                            name: editor,
                            url: "manual",
                            details:
                              "Manual editing at " + new Date().toISOString(),
                          })}
                        />
                      </TableCell>
                      <TableCell className="flex flex-row gap-3 items-start">
                        <Input
                          isEditable={teamEditable}
                          name={`team[${index}].title`}
                          className="text-gray-600 border-none shadow-none col-span-2"
                          defaultValue={item.title || "..."}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          isEditable={teamEditable}
                          name={`team[${index}].background`}
                          className="text-gray-600 border-none shadow-none col-span-5"
                          defaultValue={item.background || "..."}
                        />
                      </TableCell>
                      <TableCell>
                        <input type="hidden" name="action" value="team" />
                        <input
                          type="hidden"
                          name="profileId"
                          value={profileId}
                        />

                        <div className="flex items-center mr-2">
                          <Button
                            variant="ghost"
                            type="button"
                            className={
                              " items-center justify-center h-12 w-12 p-0 flex  rounded-md" +
                              (!teamEditable ? " hidden" : "")
                            }
                            onClick={() =>
                              setTeam((prevTeam) => {
                                const newTeam = [...prevTeam];
                                newTeam.splice(newTeam.indexOf(item), 1);
                                return newTeam;
                              })
                            }
                          >
                            <Trash2 className="w-6 h-6 margin-auto" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-content-right">
                <Button
                  className={"ml-auto" + (!teamEditable ? " hidden" : "")}
                  variant="secondary"
                  disabled={fetcher.state === "submitting"}
                  type="button"
                  onClick={() => {
                    setTeam([...team, { name: "", title: "", background: "" }]);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  <div>Add new team member</div>
                </Button>
              </div>
            </CardContent>
          </fetcher.Form>
        </Card>
      </div>

      <div className="flex flex-col gap-6 text-sm">
        {/* Key Performance Indicators */}
        <Card>
          <fetcher.Form
            method="post"
            onSubmit={(e) => handleEditable(e, () => setKpisEditable(false))}
            action="/api/business/edit"
          >
            <input type="hidden" name="action" value="kpis" />
            <input
              type="hidden"
              name="source"
              value={JSON.stringify({
                name: editor,
                url: "manual",
                details: "Manual editing at " + new Date().toISOString(),
              })}
            />
            <input type="hidden" name="profileId" value={profileId} />
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex justify-between items-center">
                <div>Key Performance Indicators</div>
                <div className="flex items-center gap-0">
                  {!kpisEditable ? (
                    <>
                      <Button
                        variant="outline"
                        className="border-none shadow-none"
                        onClick={() => {
                          const content = [
                            "Metric,Value",
                            `Total Clients,${latestFinancials?.unitEconomics?.customerCount || recentFinancials?.unitEconomics?.customerCount || "..."}`,
                            `ARR,${latestFinancials?.revenueMetrics?.arr || "..."}M`,
                            `YoY ARR Growth,${latestFinancials?.revenueMetrics?.yoyArrGrowth || recentFinancials?.revenueMetrics?.yoyArrGrowth || "..."}x`,
                            `CARR,${latestFinancials?.revenueMetrics?.carr || recentFinancials?.revenueMetrics?.carr || "..."}M`,
                            `Gross Margin,${latestFinancials?.profitabilityMetrics?.grossProfitMargin || recentFinancials?.profitabilityMetrics?.grossProfitMargin || "..."}%`,
                            `EBITDA Margin,${latestFinancials?.profitabilityMetrics?.ebitdaMargin || recentFinancials?.profitabilityMetrics?.ebitdaMargin || "..."}%`,
                            `Monthly Burn,$${latestFinancials?.cashMetrics?.monthlyBurnRate || recentFinancials?.cashMetrics?.monthlyBurnRate || "..."}`,
                            `CAC,${latestFinancials?.unitEconomics?.cac || recentFinancials?.unitEconomics?.cac || "..."}`,
                            `LTV/CAC,${latestFinancials?.unitEconomics?.ltv && latestFinancials?.unitEconomics?.cac ? (latestFinancials.unitEconomics.ltv / latestFinancials.unitEconomics.cac).toFixed(2) : "..."}`,
                            `FTEs,${teamSize || "..."}`,
                          ].join("\n");
                          navigator.clipboard.writeText(content);
                          toast("Copied to clipboard!", {
                            duration: TOAST_DURATION,
                          });
                        }}
                      >
                        <Copy className="h-4 w-4" />
                        <div>Copy</div>
                      </Button>

                      <Button
                        variant="ghost"
                        onClick={() => {
                          setKpisEditable(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                        <div>Edit</div>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        disabled={fetcher.state === "submitting"}
                        type="submit"
                        name="action"
                        value="kpis"
                      >
                        {fetcher.state === "submitting" ? (
                          <LoaderCircle className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                        <div>
                          {fetcher.state === "submitting"
                            ? "Saving..."
                            : "Save"}
                        </div>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={(e) => {
                          e.preventDefault();
                          setKpisEditable(false);
                          toast("Changes discarded", {
                            duration: TOAST_DURATION,
                          });
                        }}
                        className="ml-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Clients:</TableCell>
                    <TableCell className="flex flex-row gap-2 items-center">
                      Total:{" "}
                      <Input
                        type="number"
                        isEditable={kpisEditable}
                        name="customerCount"
                        className="text-gray-600 border-none shadow-none"
                        defaultValue={
                          latestFinancials?.unitEconomics?.customerCount ||
                          recentFinancials?.unitEconomics?.customerCount ||
                          "..."
                        }
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Revenues:</TableCell>
                    <TableCell>
                      <div className="flex flex-row gap-2 items-center justify-start">
                        <p>ARR: </p>
                        <Input
                          type="number"
                          step="any"
                          isEditable={kpisEditable}
                          min={0}
                          name="arr"
                          className="text-gray-600 border-none shadow-none max-w-[80px]"
                          defaultValue={
                            latestFinancials?.revenueMetrics?.arr
                              ? latestFinancials?.revenueMetrics?.arr
                              : "..."
                          }
                          display={
                            latestFinancials?.revenueMetrics?.arr
                              ? (
                                  latestFinancials?.revenueMetrics?.arr / 1e6
                                ).toFixed(2) + "M"
                              : "..."
                          }
                        />
                        {"-"}
                        <Input
                          type="number"
                          isEditable={kpisEditable}
                          name="yoyArrGrowth"
                          className="text-gray-600 border-none shadow-none max-w-[80px]"
                          defaultValue={
                            latestFinancials?.revenueMetrics?.yoyArrGrowth ||
                            recentFinancials?.revenueMetrics?.yoyArrGrowth ||
                            "..."
                          }
                        />
                        x growth in{" "}
                        {latestFinancials?.revenueMetrics?.yearOfReference ||
                          recentFinancials?.revenueMetrics?.yearOfReference ||
                          "..."}
                      </div>
                      <div className="flex flex-row gap-2 items-center justify-start">
                        <p> CARR: </p>
                        <Input
                          type="number"
                          step="any"
                          isEditable={kpisEditable}
                          name="carr"
                          className="text-gray-600 border-none shadow-none max-w-[80px]"
                          defaultValue={
                            latestFinancials?.revenueMetrics?.carr
                              ? latestFinancials?.revenueMetrics?.carr
                              : recentFinancials?.revenueMetrics?.carr
                                ? recentFinancials?.revenueMetrics?.carr
                                : "..."
                          }
                          display={
                            latestFinancials?.revenueMetrics?.carr
                              ? (
                                  latestFinancials?.revenueMetrics?.carr / 1e6
                                ).toFixed(2) + "M"
                              : "..."
                          }
                        />
                        {"-"}
                        <Input
                          type="number"
                          isEditable={kpisEditable}
                          name="yoyCarrGrowth"
                          className="text-gray-600 border-none shadow-none max-w-[80px]"
                          defaultValue={
                            latestFinancials?.revenueMetrics?.yoyCarrGrowth ||
                            recentFinancials?.revenueMetrics?.yoyCarrGrowth ||
                            "..."
                          }
                        />
                        x in
                        <Input
                          type="number"
                          isEditable={kpisEditable}
                          name="year"
                          className="text-gray-600 border-none shadow-none max-w-[80px]"
                          defaultValue={
                            latestFinancials?.revenueMetrics?.yearOfReference ||
                            recentFinancials?.revenueMetrics?.yearOfReference ||
                            "..."
                          }
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Margins:</TableCell>
                    <TableCell className="flex flex-row gap-2 items-center justify-start">
                      <p>Gross: </p>
                      <Input
                        type="number"
                        isEditable={kpisEditable}
                        name="grossProfitMargin"
                        className="text-gray-600 border-none shadow-none max-w-[80px]"
                        defaultValue={
                          latestFinancials?.profitabilityMetrics
                            ?.grossProfitMargin ||
                          recentFinancials?.profitabilityMetrics
                            ?.grossProfitMargin ||
                          "..."
                        }
                      />
                      <p>% | EBITDA: </p>
                      <Input
                        type="number"
                        isEditable={kpisEditable}
                        name="ebitdaMargin"
                        className="text-gray-600 border-none shadow-none max-w-[80px]"
                        defaultValue={
                          latestFinancials?.profitabilityMetrics
                            ?.ebitdaMargin ||
                          recentFinancials?.profitabilityMetrics
                            ?.ebitdaMargin ||
                          "..."
                        }
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Burn:</TableCell>
                    <TableCell className="flex flex-row gap-2 items-center">
                      <p>Monthly: $</p>
                      <Input
                        type="number"
                        isEditable={kpisEditable}
                        name="monthlyBurnRate"
                        className="text-gray-600 border-none shadow-none max-w-[80px]"
                        defaultValue={
                          latestFinancials?.cashMetrics?.monthlyBurnRate ||
                          recentFinancials?.cashMetrics?.monthlyBurnRate ||
                          "..."
                        }
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      Sales Metrics:
                    </TableCell>
                    <TableCell className="flex flex-row gap-2 items-center">
                      <p>CAC: </p>
                      <Input
                        type="number"
                        isEditable={kpisEditable}
                        name="cac"
                        className="text-gray-600 border-none shadow-none max-w-[80px]"
                        defaultValue={
                          latestFinancials?.unitEconomics?.cac ||
                          recentFinancials?.unitEconomics?.cac ||
                          "..."
                        }
                      />
                      <p>% | LTV: </p>
                      <Input
                        type="number"
                        isEditable={kpisEditable}
                        name="ltv"
                        className="text-gray-600 border-none shadow-none max-w-[80px]"
                        defaultValue={
                          latestFinancials?.unitEconomics?.ltv &&
                          latestFinancials?.unitEconomics?.ltv
                            ? latestFinancials.unitEconomics.ltv
                            : recentFinancials?.unitEconomics?.ltv
                        }
                      />

                      <input type="hidden" name="profileId" value={profileId} />
                      <input type="hidden" name="action" value="kpis" />
                      <input
                        type="hidden"
                        name="source"
                        value={JSON.stringify({
                          name: editor,
                          url: "manual",
                          details:
                            "Manual editing at " + new Date().toISOString(),
                        })}
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">FTEs:</TableCell>
                    <TableCell className="flex flex-row gap-2 items-center">
                      <Input
                        isEditable={kpisEditable}
                        name="teamSize"
                        className="text-gray-600 border-none shadow-none"
                        defaultValue={teamSize || "..."}
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </fetcher.Form>
        </Card>

        {/* Current Deal */}
        <Card>
          <fetcher.Form
            method="post"
            onSubmit={(e) => handleEditable(e, () => setDealEditable(false))}
            action="/api/business/edit"
          >
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex justify-between items-center">
                <div>Current Deal</div>
                <div className="flex items-center gap-0">
                  {!dealEditable ? (
                    <>
                      <Button
                        variant="outline"
                        className="border-none shadow-none"
                        onClick={() => {
                          const content = [
                            "Category,Value",
                            `Raise Amount,${company.currentDeal?.raiseAmount || "..."}`,
                            `Instrument Type,${company.currentDeal?.instrumentType || "..."}`,
                            `Valuation,${company.currentDeal?.valuation || "..."}`,
                            `Use of Funds,${company.currentDeal?.useOfFunds || "..."}`,
                          ].join("\n");
                          navigator.clipboard.writeText(content);
                          toast("Copied to clipboard!", {
                            duration: TOAST_DURATION,
                          });
                        }}
                      >
                        <Copy className="h-4 w-4" />
                        <div>Copy</div>
                      </Button>

                      <Button
                        variant="ghost"
                        onClick={() => {
                          setDealEditable(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                        <div>Edit</div>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        disabled={fetcher.state === "submitting"}
                        type="submit"
                        name="action"
                        value="currentDeal"
                      >
                        {fetcher.state === "submitting" ? (
                          <LoaderCircle className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                        <div>
                          {fetcher.state === "submitting"
                            ? "Saving..."
                            : "Save"}
                        </div>
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={(e) => {
                          e.preventDefault();
                          setDealEditable(false);
                          toast("Changes discarded", {
                            duration: TOAST_DURATION,
                          });
                        }}
                        type="button"
                        className="ml-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pl-3 pr-2">
              <div className="grid grid-cols-4 gap-2 items-center">
                <div className="grid col-span-1">Raise Amount</div>
                <input type="hidden" name="action" value="currentDeal" />
                <input type="hidden" name="profileId" value={profileId} />
                <input
                  type="hidden"
                  name="source"
                  value={JSON.stringify({
                    name: editor,
                    url: "manual",
                    details:
                      "edited via one pager at " + new Date().toISOString(),
                  })}
                />
                <Input
                  type="number"
                  isEditable={dealEditable}
                  name={`raiseAmount`}
                  className="text-gray-600 border-none shadow-none grid col-span-2"
                  defaultValue={
                    company.currentDeal?.raiseAmount
                      ? Number(company.currentDeal.raiseAmount)
                      : ""
                  }
                  placeholder="Round..."
                />
              </div>

              <div className="grid grid-cols-4 gap-2 items-center">
                <div className="grid col-span-1">Instrument Type</div>
                <Input
                  isEditable={dealEditable}
                  name={`instrumentType`}
                  className="text-gray-600 border-none shadow-none grid col-span-2"
                  defaultValue={company.currentDeal?.instrumentType}
                  placeholder="Amount..."
                />
              </div>

              <div className="grid grid-cols-4 gap-2 items-center">
                <div className="grid col-span-1">Valuation</div>
                <Input
                  type="number"
                  isEditable={dealEditable}
                  name={`valuation`}
                  className="text-gray-600 border-none shadow-none grid col-span-2"
                  defaultValue={
                    company.currentDeal?.valuation
                      ? Number(company.currentDeal.valuation)
                      : ""
                  }
                  placeholder="Valuation..."
                />
              </div>

              <div className="grid grid-cols-4 gap-2 items-center">
                <div className="grid col-span-1">Use of Funds</div>
                <Input
                  isEditable={dealEditable}
                  name={`useOfFunds`}
                  className="text-gray-600 border-none shadow-none grid col-span-2"
                  defaultValue={
                    Array.isArray(company.currentDeal?.useOfFunds)
                      ? company.currentDeal.useOfFunds.join(", ")
                      : company.currentDeal?.useOfFunds
                  }
                  placeholder="Investors..."
                />
              </div>
            </CardContent>
          </fetcher.Form>
        </Card>
        {/* Funding History */}
        <Card>
          <fetcher.Form
            method="post"
            onSubmit={(e) => handleEditable(e, () => setFundingEditable(false))}
            action="/api/business/edit"
          >
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex justify-between items-center">
                <div>Funding History</div>
                <div className="flex items-center gap-0">
                  {!fundingEditable ? (
                    <>
                      <Button
                        variant="outline"
                        className="border-none shadow-none"
                        onClick={() => {
                          const content = [
                            "Date,Round,Amount ($m),Lead Investors",
                            ...funding
                              .sort(
                                (a, b) =>
                                  new Date(b.date).getTime() -
                                  new Date(a.date).getTime(),
                              )
                              .map((item) => {
                                const amount = item.amount
                                  ? (item.amount / 1e6).toFixed(1)
                                  : "...";
                                return `${item.date || "..."},${item.round || "..."},${amount},${item.leadInvestor || "..."}`;
                              }),
                          ].join("\n");
                          navigator.clipboard.writeText(content);
                          toast("Copied to clipboard!", {
                            duration: TOAST_DURATION,
                          });
                        }}
                      >
                        <Copy className="h-4 w-4" />
                        <div>Copy</div>
                      </Button>

                      <Button
                        variant="ghost"
                        onClick={() => {
                          setFundingEditable(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                        <div>Edit</div>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        disabled={fetcher.state === "submitting"}
                        type="submit"
                        name="action"
                        value="funding"
                      >
                        {fetcher.state === "submitting" ? (
                          <LoaderCircle className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                        <div>
                          {fetcher.state === "submitting"
                            ? "Saving..."
                            : "Save"}
                        </div>
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={(e) => {
                          e.preventDefault();
                          setFundingEditable(false);
                          toast("Changes discarded", {
                            duration: TOAST_DURATION,
                          });
                        }}
                        type="button"
                        className="ml-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pl-3 pr-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Round</TableHead>
                    <TableHead>Amount ($m)</TableHead>
                    {/* <TableHead>Valuation (£m)</TableHead> */}
                    {/* <TableHead>Multiple</TableHead> */}
                    <TableHead>Lead Investor</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <input type="hidden" name="profileId" value={profileId} />

                  <input
                    type="hidden"
                    name="source"
                    value={JSON.stringify({
                      name: editor,
                      url: "manual",
                      details: "Manual editing at " + new Date().toISOString(),
                    })}
                  />

                  <input
                    type="hidden"
                    name="fundingData"
                    value={JSON.stringify(funding)}
                  />
                  <input type="hidden" name="action" value="funding" />
                  <input
                    type="hidden"
                    name="fundingSize"
                    value={funding.length}
                  />
                  {funding
                    .sort(
                      (a, b) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime(),
                    )
                    .map((item, index) => (
                      <TableRow>
                        <TableCell>
                          <Input
                            isEditable={fundingEditable}
                            name={`fundingData[${index}].date`}
                            type="date"
                            className="text-gray-600 border-none shadow-none grid col-span-1"
                            defaultValue={item.date}
                            placeholder="Date..."
                            display={
                              item.date
                                ? new Date(item.date)
                                    .toLocaleDateString("en-GB", {
                                      year: "numeric",
                                      month: "2-digit",
                                    })
                                    .replace("/", "/")
                                : ""
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            isEditable={fundingEditable}
                            name={`fundingData[${index}].round`}
                            className="text-gray-600 border-none shadow-none grid col-span-1"
                            defaultValue={item.round}
                            placeholder="Round..."
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            isEditable={fundingEditable}
                            name={`fundingData[${index}].amount`}
                            className="text-gray-600 border-none shadow-none grid col-span-1"
                            defaultValue={item.amount}
                            display={(item.amount / 1e6).toFixed(1)}
                            placeholder="Amount..."
                          />
                        </TableCell>
                        {/* <TableCell>
                          <Input
                            isEditable={fundingEditable}
                            name={`fundingData[${index}].valuation`}
                            className="text-gray-600 border-none shadow-none grid col-span-1"
                            defaultValue={
                              item.valuation
                                ? (item.valuation / 1e6).toFixed(1)
                                : "..."
                            }
                            placeholder="Valuation..."
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            isEditable={fundingEditable}
                            name={`fundingData[${index}].multiple`}
                            className="text-gray-600 border-none shadow-none grid col-span-1 max-w-[40px]"
                            defaultValue={item.multiple}
                            placeholder="Multiple..."
                          />
                        </TableCell> */}
                        <TableCell>
                          <Input
                            isEditable={fundingEditable}
                            name={`fundingData[${index}].leadInvestor`}
                            className="text-gray-600 border-none shadow-none grid col-span-1"
                            defaultValue={item.leadInvestor}
                            placeholder="Investors..."
                          />
                        </TableCell>
                        <TableCell>
                          {fundingEditable && (
                            <Button
                              type="button"
                              variant="ghost"
                              className={
                                "flex items-center justify-center h-12 w-12 p-0 rounded-md"
                              }
                              onClick={() =>
                                setFunding((prevFunding) => {
                                  const newFunding = [...prevFunding];
                                  newFunding.splice(
                                    newFunding.indexOf(item),
                                    1,
                                  );
                                  return newFunding;
                                })
                              }
                            >
                              <Trash2 className="w-6 h-6 margin-auto" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              <div className="flex justify-content-right">
                <Button
                  className={"ml-auto" + (!fundingEditable ? " hidden" : "")}
                  variant="secondary"
                  disabled={fetcher.state === "submitting"}
                  type="button"
                  onClick={() => {
                    setFunding([
                      ...funding,
                      {
                        date: "",
                        source: {
                          name: "manual",
                          details: `edited via one pager at ${new Date().toLocaleString()} by ${editor}`,
                        },
                        round: "Unspecified",
                        valuation: 0,
                        amount: 0,
                        leadInvestor: "",
                      },
                    ]);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  <div>Add new funding round</div>
                </Button>
              </div>
            </CardContent>
          </fetcher.Form>
        </Card>
      </div>
    </div>
  );
}
