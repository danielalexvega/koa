import React, { useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DeliveryError } from "@kontent-ai/delivery-sdk";
import { useAppContext } from "../context/AppContext";
import { useCustomRefresh, useLivePreview } from "../context/SmartLinkContext";
import { IRefreshMessageData, IRefreshMessageMetadata, IUpdateMessageData, applyUpdateOnItemAndLoadLinkedItems } from "@kontent-ai/smart-link";
import { LanguageCodenames, type CampgroundType } from "../model";
import { createClient } from "../utils/client";
import PageSection from "../components/PageSection";
import { createElementSmartLink, createItemSmartLink } from "../utils/smartlink";
import { defaultPortableRichTextResolvers, isEmptyRichText } from "../utils/richtext";
import { PortableText } from "@portabletext/react";
import { transformToPortableText } from "@kontent-ai/rich-text-resolver";
import CampGroundCTABanner from "../components/CampGroundCTABanner";
import CampgroundNavigation from "../components/CampgroundNavigation";

const CampGroundDetailPage: React.FC = () => {
    const { environmentId, apiKey } = useAppContext();
    const { slug } = useParams();
    const [searchParams] = useSearchParams();
    const isPreview = searchParams.get("preview") === "true";
    const lang = searchParams.get("lang");
    const queryClient = useQueryClient();

    const { data: campground, refetch } = useQuery({
        queryKey: ["campground-detail", slug, lang, isPreview],
        queryFn: async () => {
            try {
                const response = await createClient(environmentId, apiKey, isPreview)
                    .item<CampgroundType>(slug ?? "")
                    .languageParameter((lang ?? "default") as LanguageCodenames)
                    .toPromise();

                return response.data.item ?? null;
            } catch (err) {
                if (err instanceof DeliveryError) {
                    return null;
                }
                throw err;
            }
        },
        enabled: !!slug,
    });

    const handleLiveUpdate = useCallback((data: IUpdateMessageData) => {
        if (campground) {
            applyUpdateOnItemAndLoadLinkedItems(
                campground,
                data,
                (codenamesToFetch: readonly string[]) => createClient(environmentId, apiKey, isPreview)
                    .items()
                    .inFilter("system.codename", [...codenamesToFetch])
                    .toPromise()
                    .then(res => res.data.items)
            ).then((updatedItem) => {
                if (updatedItem) {
                    queryClient.setQueryData(["campground-detail", slug, lang, isPreview], updatedItem);
                }
            });
        }
    }, [campground, environmentId, apiKey, isPreview, slug, lang, queryClient]);

    useLivePreview(handleLiveUpdate);

    const onRefresh = useCallback(
        (_: IRefreshMessageData, metadata: IRefreshMessageMetadata, originalRefresh: () => void) => {
            if (metadata.manualRefresh) {
                originalRefresh();
            } else {
                refetch();
            }
        },
        [refetch],
    );

    useCustomRefresh(onRefresh);

    if (!campground) {
        return <div className="flex-grow" />;
    }
    console.log(campground);

    const bannerImage = campground.elements.banner_image?.value?.[0];
    const bookNowImage = campground.elements.book_now_cta_background_image?.value?.[0];
    const bookNowVideo = campground.elements.book_now_cta_background_video_link?.value;
    const bookNowText = campground.elements.book_now_cta_text?.value;
    const campgroundName = campground.elements.name?.value;
    const bookingLink = "/";

    // Navigation data
    const phone = campground.elements.phone_number?.value;
    const email = campground.elements.email_address?.value;
    const directions = "#";
    const waysToStay = campground.elements.ways_to_stay?.value?.map(way => way.name) || [];
    const navigationItems = campground.elements.menu?.linkedItems?.map(item => item.elements.headline?.value || item.system.name) || [];

    return (
        <div className="flex flex-col">


            {/* Book Now CTA Banner */}
            <CampGroundCTABanner
                bookNowCtaBackgroundImage={bookNowImage?.url}
                bookNowCtaBackgroundVideoLink={bookNowVideo}
                bookNowCtaText={bookNowText}
                campgroundName={campgroundName}
                bookingLink={bookingLink}
            />

            {/* Campground Navigation */}
            <CampgroundNavigation
                telephone={phone}
                emailAddress={email}
                directionsLink={directions}
                waysToStay={waysToStay}
                navigation={navigationItems}
            />

            {/* Banner Section */}
            <PageSection color="transparent">
                <div className="relative">
                    {bannerImage && (
                        <div
                            className="w-full h-96 bg-cover bg-center bg-no-repeat"
                            style={{
                                backgroundImage: `url(${bannerImage.url})`,
                            }}
                        />
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-40" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-white px-4">
                            <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg"
                                {...createItemSmartLink(campground.system.id)}
                                {...createElementSmartLink("banner_header")}
                            >
                                {campground.elements.banner_header?.value}
                            </h1>
                        </div>
                    </div>
                </div>
            </PageSection>

            {/* Campground Information */}
            <PageSection color="bg-white">
                <div className="max-w-4xl mx-auto px-4 py-12">
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Contact Information */}
                        <div>
                            <h2 className="text-3xl font-bold text-burgundy mb-6">Contact Information</h2>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold text-lg text-gray-dark">Name</h3>
                                    <p className="text-gray"
                                        {...createItemSmartLink(campground.system.id)}
                                        {...createElementSmartLink("name")}
                                    >
                                        {campground.elements.name?.value}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg text-gray-dark">Phone</h3>
                                    <p className="text-gray"
                                        {...createItemSmartLink(campground.system.id)}
                                        {...createElementSmartLink("phone_number")}
                                    >
                                        {campground.elements.phone_number?.value}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg text-gray-dark">Email</h3>
                                    <p className="text-gray"
                                        {...createItemSmartLink(campground.system.id)}
                                        {...createElementSmartLink("email_address")}
                                    >
                                        {campground.elements.email_address?.value}
                                    </p>
                                </div>
                                {campground.elements.address?.value && (
                                    <div>
                                        <h3 className="font-semibold text-lg text-gray-dark">Address</h3>
                                        <p className="text-gray"
                                            {...createItemSmartLink(campground.system.id)}
                                            {...createElementSmartLink("address")}
                                        >
                                            {campground.elements.address.value}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Amenities */}
                        <div>
                            <h2 className="text-3xl font-bold text-burgundy mb-6">Amenities</h2>
                            {campground.elements.amenities?.value && (
                                <div className="flex flex-wrap gap-2"
                                    {...createItemSmartLink(campground.system.id)}
                                    {...createElementSmartLink("amenities")}
                                >
                                    {campground.elements.amenities.value.map((amenity, index) => (
                                        <span
                                            key={index}
                                            className="bg-azure text-white px-3 py-1 rounded-full text-sm"
                                        >
                                            {amenity.name}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </PageSection>

            {/* Banner Body Content */}
            {!isEmptyRichText(campground.elements.banner_body?.value) && (
                <PageSection color="bg-creme">
                    <div className="flex flex-col pt-10 mx-auto gap-6"
                        {...createItemSmartLink(campground.system.id)}
                        {...createElementSmartLink("banner_body")}
                    >
                        <PortableText
                            value={transformToPortableText(campground.elements.banner_body?.value)}
                            components={defaultPortableRichTextResolvers}
                        />
                    </div>
                </PageSection>
            )}

            {/* Ways to Stay */}
            {campground.elements.ways_to_stay?.value && (
                <PageSection color="bg-white">
                    <div className="max-w-4xl mx-auto px-4 py-12">
                        <h2 className="text-3xl font-bold text-burgundy mb-6">Ways to Stay</h2>
                        <div className="flex flex-wrap gap-2"
                            {...createItemSmartLink(campground.system.id)}
                            {...createElementSmartLink("ways_to_stay")}
                        >
                            {campground.elements.ways_to_stay.value.map((way, index) => (
                                <span
                                    key={index}
                                    className="bg-burgundy text-white px-4 py-2 rounded-lg text-sm font-semibold"
                                >
                                    {way.name}
                                </span>
                            ))}
                        </div>
                    </div>
                </PageSection>
            )}


            {/* Menu/Subpages */}
            {campground.elements.menu?.linkedItems && campground.elements.menu.linkedItems.length > 0 && (
                <PageSection color="bg-white">
                    <div className="max-w-4xl mx-auto px-4 py-12">
                        <h2 className="text-3xl font-bold text-burgundy mb-6">More Information</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
                            {...createItemSmartLink(campground.system.id)}
                            {...createElementSmartLink("menu")}
                        >
                            {campground.elements.menu.linkedItems.map((page) => (
                                <a
                                    key={page.system.codename}
                                    href={`/${page.elements.url?.value || page.system.codename}`}
                                    className="block p-4 border border-gray-200 rounded-lg hover:border-burgundy hover:shadow-md transition-all duration-200"
                                >
                                    <h3 className="font-semibold text-lg text-gray-dark mb-2">
                                        {page.elements.headline?.value}
                                    </h3>
                                    {page.elements.subheadline?.value && (
                                        <p className="text-gray text-sm">
                                            {page.elements.subheadline.value}
                                        </p>
                                    )}
                                </a>
                            ))}
                        </div>
                    </div>
                </PageSection>
            )}
        </div>
    );
};

export default CampGroundDetailPage;