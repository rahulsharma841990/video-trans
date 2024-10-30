import React, { useState } from "react";
import Layout from "../components/Layout";
import Form from "../components/Form";
import axios from "axios";

export default function Home() {
    const [mediaData, setMediaData] = useState();
    const [loading, setLoading] = useState(false);
    const [transcript, setTranscript] = useState("");

    const downloadMedia = async (e) => {
        e.preventDefault();
        const mediaUrl = e.target.mediaUrl.value;
        // verify if the url is empty
        if (!mediaUrl) {
            alert("Please enter a valid url");
            return;
        }
        // verify if the url is valid for facebook video, youtube video, instagram video, tiktok video
        if (
            !mediaUrl.includes("facebook") &&
            !mediaUrl.includes("youtube") &&
            !mediaUrl.includes("instagram") &&
            !mediaUrl.includes("tiktok")
        ) {
            alert(
                "Please enter a valid url for facebook, youtube, instagram, tiktok"
            );
            return;
        }
        const options = {
            method: "GET",
            url: "https://social-media-video-downloader.p.rapidapi.com/smvd/get/all",
            params: {
                url: mediaUrl,
                filename: "video",
            },
            headers: {
                "X-RapidAPI-Key":
                    "475b98ad39mshabe0e4894c0129ep1f325ajsndb618830391d",
                "X-RapidAPI-Host":
                    "social-media-video-downloader.p.rapidapi.com",
            },
        };

        setLoading(true);
        try {
            const response = await axios.request(options);
            let videoLink = response.data.links[0].link;

            // Send video URL to local server for downloading
            try {
                const downloadResponse = await axios.get(
                    "http://localhost:5656/download",
                    {
                        params: {
                            url: videoLink,
                        },
                    }
                );
                console.log(downloadResponse);
                if (downloadResponse.data.success) {
                    getTranscript();
                    console.log("Video downloaded successfully on server");
                } else {
                    console.error("Error downloading video on server");
                }
            } catch (downloadError) {
                console.error("Error making download request:", downloadError);
            }

            console.log(response.data);
            setMediaData(response.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };
    const getTranscript = async () => {
        try {
            const transcriptResponse = await axios.get(
                "http://localhost:5656/transcript"
            );
            if (transcriptResponse.data.success) {
                setTranscript(transcriptResponse.data.transcription);
                console.log(transcriptResponse);
            } else {
                console.error("Error getting transcript");
            }
        } catch (error) {
            console.error("Error making transcript request:", error);
        }
    };
    return (
        <Layout>
            <div className="text-center py-2 space-y-2 m-2">
                <h1 className="text-2xl md:text-4xl capitalize text-center text-bold bg-gradient-to-r from-rose-700 to-pink-600 bg-clip-text text-transparent">
                    {" "}
                    Download Video from Facebook, Youtube, Instagram, Tiktok .{" "}
                </h1>
                <p className="text-sm md:text-lg text-center bg-gradient-to-r from-green-200 via-green-400 to-green-500 bg-clip-text text-transparent">
                    Just paste the link and download the video you want.
                </p>
                <Form mediaDownload={downloadMedia} />
                {/* show loading 100% with loading indicator */}
                {loading && (
                    <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-rose-700"></div>
                    </div>
                )}
                {/* video output */}
                <div className="flex justify-center">
                    {mediaData && (
                        <video
                            controls
                            className="w-full md:w-6/12 max-h-80 rounded-md"
                        >
                            {/* if i enter new url change the src */}
                            <source
                                src={mediaData.links[0].link}
                                type="video/mp4"
                            />
                            Your browser does not support the video tag.
                        </video>
                    )}
                </div>
                {/* title */}
                <div className="flex justify-center">
                    {mediaData && (
                        <h2 className="text-2xl md:text-4xl capitalize text-center text-bold bg-gradient-to-r from-rose-700 to-pink-600 bg-clip-text text-transparent">
                            {mediaData.title}
                        </h2>
                    )}
                </div>

                {/* download button */}
                <div className="flex justify-center space-x-3">
                    {mediaData &&
                        mediaData.links.map((link, index) => (
                            <a
                                key={index}
                                href={link.link}
                                download
                                className="bg-blue-500 text-white p-2 bg-gradient-to-r from-rose-700 to-pink-600"
                            >
                                Download {link.quality}
                            </a>
                        ))}
                </div>
            </div>
            {/* transcript */}
            <div className="flex justify-center">
                <p>{transcript}</p>
            </div>
        </Layout>
    );
}
