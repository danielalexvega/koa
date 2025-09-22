import React, { useCallback, useState, useEffect } from "react";
import PageSection from "../components/PageSection";
import { useAppContext } from "../context/AppContext";
import { createClient } from "../utils/client";
import { DeliveryError } from "@kontent-ai/delivery-sdk";
import Deal from "../components/deal/Deal";
import { PageType as Page, DealsType, LanguageCodenames } from "../model";
import { useSearchParams } from "react-router-dom";
import { defaultPortableRichTextResolvers, isEmptyRichText } from "../utils/richtext";
import { PortableText } from "@portabletext/react";
import { transformToPortableText } from "@kontent-ai/rich-text-resolver";
import { IRefreshMessageData, IRefreshMessageMetadata, IUpdateMessageData, applyUpdateOnItemAndLoadLinkedItems } from "@kontent-ai/smart-link";
import { useCustomRefresh, useLivePreview } from "../context/SmartLinkContext";
import { createElementSmartLink, createItemSmartLink } from "../utils/smartlink";
import { useSuspenseQueries } from "@tanstack/react-query";
// import { log } from "console";
// import { Replace } from "../utils/types";

// Use the generated DealsType
// type DealType = DealsType;

const useDealsPage = (isPreview: boolean, lang: string | null) => {
  const { environmentId, apiKey } = useAppContext();
  const [page, setPage] = useState<Page | null>(null);

  const handleLiveUpdate = useCallback((data: IUpdateMessageData) => {
    if (page) {
      applyUpdateOnItemAndLoadLinkedItems(
        page,
        data,
        (codenamesToFetch) => createClient(environmentId, apiKey, isPreview)
          .items()
          .inFilter("system.codename", [...codenamesToFetch])
          .toPromise()
          .then(res => res.data.items)
      ).then((updatedItem) => {
        if (updatedItem) {
          setPage(updatedItem as Page);
        }
      });
    }
  }, [page, environmentId, apiKey, isPreview]);

  useEffect(() => {
    // Try to fetch a deals page, but don't fail if it doesn't exist
    createClient(environmentId, apiKey, isPreview)
      .item<Page>("deals")
      .languageParameter((lang ?? "default") as LanguageCodenames)
      .toPromise()
      .then(res => {
        setPage(res.data.item);
      })
      .catch((err) => {
        if (err instanceof DeliveryError) {
          console.log("Deals page not found, using default content");
          setPage(null);
        } else {
          throw err;
        }
      });
  }, [environmentId, apiKey, isPreview, lang]);

  useLivePreview(handleLiveUpdate);

  return page;
};

// I need to get the deals
const useDeals = (isPreview: boolean, lang: string | null) => {
    const { environmentId, apiKey } = useAppContext();
    const [deals, setDeals] = useState<DealsType[]>([]);
  
    const handleLiveUpdate = useCallback((data: IUpdateMessageData) => {
      setDeals(prevDeals => {
        return prevDeals.map(deal => {
          if (deal.system.codename === data.item.codename) {
            // Apply the update and handle the Promise
            applyUpdateOnItemAndLoadLinkedItems(
              deal,
              data,
              (codenamesToFetch) => createClient(environmentId, apiKey, isPreview)
                .items()
                .inFilter("system.codename", [...codenamesToFetch])
                .toPromise()
                .then(res => res.data.items)
            ).then((updatedItem) => {
              if (updatedItem) {
                setDeals(prev => prev.map(p =>
                  p.system.codename === data.item.codename ? updatedItem as DealsType : p
                ));
              }
            });
            return deal; // Return the current post while waiting for the update
          }
          return deal;
        });
      });
    }, [environmentId, apiKey, isPreview]);
  
    useEffect(() => {
      createClient(environmentId, apiKey, isPreview)
        .items<DealsType>()
        .type("deals")
        .languageParameter((lang ?? "default") as LanguageCodenames)
        .toPromise()
        .then(res => {
          setDeals(res.data.items);
        })
        .catch((err) => {
          if (err instanceof DeliveryError) {
            setDeals([]);
          } else {
            throw err;
          }
        });
    }, [environmentId, apiKey, isPreview, lang]);
  
    useLivePreview(handleLiveUpdate);
  
    return deals;
  };


const DealsListingPage: React.FC = () => {
  const { environmentId, apiKey } = useAppContext();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get("preview") === "true";
  const lang = searchParams.get("lang");

const dealsPage = useDealsPage(isPreview, lang);
const deals = useDeals(isPreview, lang);


  const [dealsData] = useSuspenseQueries({
    queries: [
      {
        queryKey: ["deals", lang, isPreview],
        queryFn: () =>
          createClient(environmentId, apiKey, isPreview)
            .items<DealsType>()
            .type("deals")
            .languageParameter((lang ?? "default") as LanguageCodenames)
            .toPromise()
            .then(res => res.data.items)
            .catch((err) => {
              if (err instanceof DeliveryError) {
                console.log("No deals found or error fetching deals");
                return [];
              }
              throw err;
            }),
      },
    ],
  });

  console.log(dealsData.data);
  

  const onRefresh = useCallback(
    (_: IRefreshMessageData, metadata: IRefreshMessageMetadata, originalRefresh: () => void) => {
      if (metadata.manualRefresh) {
        originalRefresh();
      } else {
        dealsData.refetch();
      }
    },
    [dealsPage],
  );

  useCustomRefresh(onRefresh);

  // Don't return early if page doesn't exist - we'll use default content

//   const deals = dealsQuery.data || [];

  if (!dealsPage || !deals) {
    return <div className="flex-grow" />;
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <PageSection color="bg-azure">
        <div className="azure-theme flex flex-col items-center pt-[104px] pb-[160px] text-center">
          <div className="max-w-4xl">
            <h1 
              className="text-heading-1 leading-[84%] text-heading-1-color mb-6"
              {...(dealsPage && createItemSmartLink(dealsPage.system.id))}
              {...(dealsPage && createElementSmartLink("headline"))}
            >
              {dealsPage?.elements.headline?.value || "Current Deals"}
            </h1>
            {dealsPage && !isEmptyRichText(dealsPage.elements.body?.value) && (
              <div className="rich-text-body text-body-xl text-body-color"
                {...createItemSmartLink(dealsPage.system.id)}
                {...createElementSmartLink("body")}
              >
                <PortableText
                  value={transformToPortableText(dealsPage.elements.body?.value)}
                  components={defaultPortableRichTextResolvers}
                />
              </div>
            )}
          </div>
        </div>
      </PageSection>

      {/* Deals Grid */}
      <PageSection color="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          {deals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {deals.map((deal) => (
                <Deal
                  key={deal.system.codename}
                  dealTitle={deal.elements.deal_title?.value || ""}
                  startDate={deal.elements.start?.value || ""}
                  endDate={deal.elements.end?.value || ""}
                  body={deal.elements.body?.value}
                  dealImage={deal.elements.deal_image?.value?.[0] ? {
                    url: deal.elements.deal_image.value[0].url,
                    alt: deal.elements.deal_image.value[0].description || undefined
                  } : undefined}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">
                No deals available at this time.
              </div>
              <div className="text-gray-400 text-sm mt-2">
                Check back soon for exciting offers!
              </div>
            </div>
          )}
        </div>
      </PageSection>
    </div>
  );
};

export default DealsListingPage;
