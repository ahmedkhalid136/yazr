import { useEffect, useState } from "react";
import { marked } from "marked";



const urls = [
    "https://randompublicalfredo.s3.eu-west-2.amazonaws.com/deck/arr.png",
    "https://randompublicalfredo.s3.eu-west-2.amazonaws.com/deck/competitiongraph.png",
    "https://randompublicalfredo.s3.eu-west-2.amazonaws.com/deck/competitionTable.png",
    "https://randompublicalfredo.s3.eu-west-2.amazonaws.com/deck/loadsAndGrph.png",
    "https://randompublicalfredo.s3.eu-west-2.amazonaws.com/deck/marketsize.png",
    "https://randompublicalfredo.s3.eu-west-2.amazonaws.com/deck/marketSize2.png",
    "https://randompublicalfredo.s3.eu-west-2.amazonaws.com/deck/p&l.png",
    "https://randompublicalfredo.s3.eu-west-2.amazonaws.com/deck/piechart.png",
    "https://randompublicalfredo.s3.eu-west-2.amazonaws.com/deck/rev.png",
    "https://randompublicalfredo.s3.eu-west-2.amazonaws.com/deck/timeline.png",
    "https://randompublicalfredo.s3.eu-west-2.amazonaws.com/deck/traction.png",
]


export default function Test() {
    const [markdownOpenAI, setMarkdownOpenAI] = useState<string>("")
    const [markdownClaud, setMarkdownClaud] = useState<string>("")
    const [markdownGemini, setMarkdownGemini] = useState<string>("")
    const [counter, setCounter] = useState<number>(0)
    const url = urls[counter]
    const handleButtonPlus = () => {
        setCounter(counter + 1)
    }
    const handleButtonMinus = () => {
        setCounter(counter - 1)
    }
    useEffect(() => {
        const getMarkdown = async (img: string) => {
            const formData = new FormData()
            formData.append("url", img)
            formData.append("model", "oai")
            const response = await fetch("/ai", {
                method: "POST",
                body: formData
            })
            const markdown = await response.json()
            if (markdown) {
            setMarkdownOpenAI(JSON.parse(markdown.markdown).message.content)
        }
    }
    getMarkdown(url)
    }, [url])

    useEffect(() => {
        const getMarkdown = async (img: string) => {
            const formData = new FormData()
            formData.append("url", img)
            formData.append("model", "gemini")
            const response = await fetch("/ai", {
                method: "POST",
                body: formData
            })
            console.log(response)
            const markdown = await response.json()

            if (markdown) {       
            setMarkdownGemini(JSON.parse(markdown.markdown))
            }
        }
        getMarkdown(url)
    
    }, [url])


    useEffect(() => {
        const getMarkdown = async (img: string) => {
            const formData = new FormData()
            formData.append("url", img)
            formData.append("model", "claud")
            const response = await fetch("/ai", {
                method: "POST",
                body: formData
            })
            const markdown = await response.json()
            console.log("claude",markdown)
            if (markdown) {
            setMarkdownClaud(JSON.parse(markdown.markdown))
            }
        }
        
        getMarkdown(url)
    
    }, [url])



    return (
        <div className="p-4 bg-black w-fill max-w-screen-xl m-auto">
            <div className="flex flex-row m-auto items-center justify-center">
                <button onClick={handleButtonMinus} className="text-white p-2 bg-gray-400 rounded-md"> - </button>
                <p className="text-white px-4">{counter}</p>
                <button onClick={handleButtonPlus} className="text-white p-2 bg-gray-400 rounded-md"> + </button>
            </div>
            <div className=" mt-8">
                <img src={url} alt={`img-${counter}`} className="w-auto h-[600px]" />
                <div className="prose prose-lg bg-white mt-12">
                    <div dangerouslySetInnerHTML={{ __html: marked(markdownOpenAI) }} />
                </div>
                <div className="prose prose-lg bg-white mt-12">
                    <div dangerouslySetInnerHTML={{ __html: marked(markdownGemini) }} />
                </div>
                <div className="prose prose-lg bg-white mt-12">
                    <div dangerouslySetInnerHTML={{ __html: marked(markdownClaud) }} />
                </div>
            </div>
        </div>
    );
}





