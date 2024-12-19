import { Button } from "@nextui-org/button";

interface ErrorPageProps {
  searchParams: {
    SiteCode?: string;
    TransactionId?: string;
    TransactionReference?: string;
    Amount?: string;
    Status?: string;
    Optional1?: string;
    Optional2?: string;
    Optional3?: string;
    Optional4?: string;
    Optional5?: string;
    CurrencyCode?: string;
    IsTest?: string;
    StatusMessage?: string;
    Hash?: string;
  };
}

export default function ErrorPage({ searchParams }: ErrorPageProps) {
  const params = Object.entries(searchParams).map(([key, value]) => (
    <div key={key} className="mb-2">
      {key}: {value || "N/A"}
    </div>
  ));

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-red-600">Transaction Error</h1>
      <div className="p-4 rounded-lg">
        {params}
      </div>
      <Button className="mt-4" href="/" as="a">
        Return Home
      </Button>
    </div>
  );
}