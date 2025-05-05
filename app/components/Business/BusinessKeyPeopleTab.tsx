import { useState } from "react";
import { LoaderCircle, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BusinessProfile,
  PeriodFinancialsSchemaType,
} from "@/lib/typesCompany";
import { Label } from "@/components/ui/label";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CrustDataItem } from "@/lib/types_dep";
import { Link } from "@remix-run/react";

// Define the structure of the employee data
interface EmployeeData {
  date: string;
  employee_count: number;
}

// Category definitions for role grouping
const roleCategories = {
  "Product & Tech": [
    "Engineering",
    "Information Technology",
    "Product Management",
    "IT ",
    "Software",
  ],
  "Customer acquisition": [
    "Business development",
    "Customer success and support",
    "Marketing",
    "Sales",
    "Media and communication",
    "PR ",
  ],
  Operations: [
    "Administrative",
    "Finance",
    "Operations",
    "Ops",
    "HR ",
    "Human ",
  ],
};

const timeSeriesPeoplebyFunction = (
  crustdata: CrustDataItem,
): {
  dates: string[];
  categories: string[];
  roles: Record<string, string[]>;
  timeSeries: Record<string, number[]>;
  categoryTotals: Record<string, number[]>;
} => {
  const dates: string[] = [];
  // last 12 months numbers
  for (let i = 0; i < 12; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - i - 1);
    const dateString = date.toISOString().split("T")[0];
    dates.push(dateString);
  }

  // Reverse dates to go from oldest to newest (chronological order)
  dates.reverse();

  const allRoles = Object.keys(
    crustdata.headcount.linkedin_headcount_by_function_timeseries
      ?.CURRENT_FUNCTION || {},
  );

  // Categorize roles
  const categorizedRoles: Record<string, string[]> = {
    "Product & Tech": [],
    "Customer acquisition": [],
    Operations: [],
    Other: [],
  };

  // Assign each role to a category
  allRoles.forEach((role) => {
    let assigned = false;
    for (const [category, categoryRoles] of Object.entries(roleCategories)) {
      if (
        categoryRoles.some((catRole) =>
          role.toLowerCase().includes(catRole.toLowerCase()),
        )
      ) {
        categorizedRoles[category].push(role);
        assigned = true;
        break;
      }
    }

    if (!assigned) {
      categorizedRoles["Other"].push(role);
    }
  });

  const categories = Object.keys(categorizedRoles);

  // Calculate time series for each role
  const timeSeries = allRoles.reduce(
    (acc, role) => {
      const count = [];
      for (let i = 0; i < dates.length - 1; i++) {
        const date1 = dates[i];
        const date2 = dates[i + 1];
        const eC =
          crustdata.headcount.linkedin_headcount_by_function_timeseries?.CURRENT_FUNCTION?.[
            role
          ]?.find(
            (d) =>
              new Date(d.date) < new Date(date2) &&
              new Date(d.date) > new Date(date1),
          )?.employee_count || 0;
        count.push(eC);
      }
      // Add the last value
      const lastDate = dates[dates.length - 1];
      const lastEC =
        crustdata.headcount.linkedin_headcount_by_function_timeseries?.CURRENT_FUNCTION?.[
          role
        ]?.find((d) => new Date(d.date) > new Date(lastDate))?.employee_count ||
        0;
      count.push(lastEC);

      acc[role] = count;
      return acc;
    },
    {} as Record<string, number[]>,
  );

  // Calculate category totals
  const categoryTotals = categories.reduce(
    (acc, category) => {
      const totals = new Array(dates.length).fill(0);

      categorizedRoles[category].forEach((role) => {
        if (timeSeries[role]) {
          for (let i = 0; i < dates.length; i++) {
            totals[i] += timeSeries[role][i] || 0;
          }
        }
      });

      acc[category] = totals;
      return acc;
    },
    {} as Record<string, number[]>,
  );

  console.log("timeSeries", timeSeries);
  console.log("categoryTotals", categoryTotals);

  // Get the total FTEs from the data
  const fte_totals = crustdata.headcount.linkedin_headcount;

  // Calculate the sum of the latest headcount values (last index in each category array)
  const latestTotals = categories.reduce((total, category) => {
    const latestValue =
      categoryTotals[category][categoryTotals[category].length - 1] || 0; // Use last element (most recent)
    return total + latestValue;
  }, 0);

  // If we have valid totals, normalize the category values to match the reported total FTEs
  if (latestTotals > 0) {
    categories.forEach((category) => {
      // Apply scaling factor to each value in the array
      categoryTotals[category] = categoryTotals[category].map((value) =>
        Math.round((value * fte_totals) / latestTotals),
      );
    });
  }

  return {
    dates,
    categories,
    roles: categorizedRoles,
    timeSeries,
    categoryTotals,
  };
};

// Define job opening type
interface JobOpening {
  url: string;
  title: string;
  date_updated?: string;
  location_text: string;
  category: string;
}

export function BusinessKeyPeople({
  company,
  crustdata,
}: {
  company: BusinessProfile;
  crustdata: CrustDataItem;
}) {
  const { dates, categories, roles, timeSeries, categoryTotals } =
    timeSeriesPeoplebyFunction(crustdata);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const toggleCategory = (category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  // Format data for the chart
  const chartData = dates.map((date, index) => {
    const dataPoint: Record<string, any> = {
      date: new Date(date).toLocaleDateString(undefined, {
        month: "2-digit",
        year: "2-digit",
      }),
    };

    categories.forEach((category) => {
      dataPoint[category] = categoryTotals[category][index] || 0;
    });

    return dataPoint;
  });

  // Define chart colors
  const categoryColors = {
    "Product & Tech": "#8884d8",
    "Customer acquisition": "#82ca9d",
    Operations: "#ffc658",
    Other: "#ff8042",
  };

  return (
    <div className="max-w-full overflow-x-auto">
      <div className="flex max-w-full">
        <div className="w-3/4 overflow-x-auto">
          <h1 className="w-full ml-4 text-2xl font-bold">Headcount data</h1>
          <p className="ml-4 text-gray-600 font-bold">
            Total FTEs {crustdata.headcount.linkedin_headcount}
          </p>

          {/* Headcount Chart */}
          <div className="w-full h-80 mt-6 mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                {categories.map((category, index) => (
                  <Line
                    key={category}
                    type="monotone"
                    dataKey={category}
                    stroke={
                      categoryColors[category as keyof typeof categoryColors] ||
                      `#${Math.floor(Math.random() * 16777215).toString(16)}`
                    }
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <Table>
            <TableBody>
              <TableRow>
                <TableCell>Role</TableCell>
                {dates.slice(0, 12).map((d) => (
                  <TableCell key={d}>
                    {new Date(d).toLocaleDateString(undefined, {
                      month: "2-digit",
                      year: "2-digit",
                    })}
                  </TableCell>
                ))}
              </TableRow>
              {categories.map((category) => (
                <>
                  <TableRow
                    key={category}
                    className="font-bold hover:bg-gray-100 cursor-pointer"
                    onClick={() => toggleCategory(category)}
                  >
                    <TableCell>{category}</TableCell>
                    {categoryTotals[category].map(
                      (d: number, index: number) => (
                        <TableCell key={`${category}${index}`}>{d}</TableCell>
                      ),
                    )}
                  </TableRow>
                  {expandedCategory === category &&
                    category !== "Other" &&
                    roles[category].map((role) => (
                      <TableRow key={role} className="bg-gray-50">
                        <TableCell className="pl-8">{role}</TableCell>
                        {timeSeries[role].map((d: number, index: number) => (
                          <TableCell key={`${role}${index}`}>{d}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                </>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="w-1/4 mx-8 mt-12">
          {crustdata.job_openings.recent_job_openings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent job openings</CardTitle>
              </CardHeader>
              <CardContent>
                {(
                  crustdata.job_openings.recent_job_openings as JobOpening[]
                ).map((jobs) => (
                  <div key={jobs.url} className="mb-4">
                    <Link to={jobs.url} target="_blank">
                      <p className="text-gray-900 text-sm font-bold">
                        {jobs.title}
                      </p>
                    </Link>
                    <p className="text-gray-600 text-xs">
                      {jobs.date_updated
                        ? new Date(jobs.date_updated).toLocaleDateString(
                            undefined,
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "2-digit",
                            },
                          )
                        : ""}
                    </p>
                    <p className="text-gray-600 text-xs ">
                      Location:{jobs.location_text}
                    </p>
                    <p className="text-gray-600 text-xs">
                      Category: {jobs.category}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <h1 className="text-2xl font-bold mt-12">Key People</h1>
      <div className="grid grid-cols-3 gap-6 mt-4 ">
        {[
          ...(company.companyProfile?.teamInfo?.leadership || []),
          // ...(company.companyProfile?.teamInfo?.keyRoles || []),
        ].map((person) => (
          <Card key={person.name}>
            <CardContent className="space-y-4 p-3">
              <div className="flex flex-row">
                <div className="flex flex-col ml-3 text-gray-600">
                  <h5 className="text-lg font-bold text-gray-800">
                    {person.name}
                  </h5>
                  <p className="font-semibold text-gray-800">{person.title}</p>
                  {person.linkedin && (
                    <p className="mt-2">
                      <Link to={person.linkedin} target="_blank">
                        LinkedIn Link
                      </Link>
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-[0.5] text-gray-600 p-3">
                <p className="font-semibold text-gray-800">
                  Previous Experience
                </p>

                <div className="p-0 text-xs">
                  <div>{person.background}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
