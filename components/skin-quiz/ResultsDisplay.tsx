"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Card,
  Typography,
  Button,
  Spin,
  Empty,
  Tag,
  Rate,
  Select,
  Divider,
  Row,
  Col,
  Alert,
} from "antd";
import { ShoppingCart, Filter, Save, Share2, Download } from "lucide-react";
import { toast } from "sonner";

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

interface RecommendationItem {
  product: Product;
  score: number;
  matchReasons: string[];
}

interface ResultsDisplayProps {
  analysisId: string;
}

export default function ResultsDisplay({ analysisId }: ResultsDisplayProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>(
    []
  );
  const [filteredRecommendations, setFilteredRecommendations] = useState<
    RecommendationItem[]
  >([]);
  const [sortOption, setSortOption] = useState<string>("relevance");
  const [skinAnalysis, setSkinAnalysis] = useState<any>(null);
  const router = useRouter();

  // Fetch analysis results
  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/skin-analysis?id=${analysisId}`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch results");
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to fetch results");
        }

        setSkinAnalysis(data.analysis);

        // Transform recommended products into the format we need
        const recommendedProducts = data.analysis.recommendedProducts.map(
          (product: any) => ({
            product: {
              _id: product._id,
              name: product.name,
              description: product.description,
              price: product.price,
              image: product.image,
            },
            // Since we don't have scores stored, we'll generate them based on position
            score: 100 - data.analysis.recommendedProducts.indexOf(product) * 5,
            // Generate match reasons based on skin type and concerns
            matchReasons: generateMatchReasons(product, data.analysis),
          })
        );

        setRecommendations(recommendedProducts);
        setFilteredRecommendations(recommendedProducts);
      } catch (err) {
        console.error("Error fetching results:", err);
        setError(
          "Failed to load your personalized recommendations. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    if (analysisId) {
      fetchResults();
    }
  }, [analysisId]);

  // Generate match reasons based on product description and skin analysis
  const generateMatchReasons = (product: any, analysis: any): string[] => {
    const reasons: string[] = [];
    const description = product.description.toLowerCase();

    // Check for skin type match
    if (description.includes(analysis.skinType.toLowerCase())) {
      reasons.push(`Formulated for ${analysis.skinType} skin`);
    }

    // Check for skin concerns matches
    analysis.skinConcerns.forEach((concern: string) => {
      if (description.includes(concern.toLowerCase())) {
        reasons.push(`Addresses ${concern}`);
      }
    });

    // If no specific reasons found, add a generic one
    if (reasons.length === 0) {
      reasons.push("Matches your skin profile");
    }

    return reasons;
  };

  // Handle sorting
  const handleSortChange = (value: string) => {
    setSortOption(value);

    let sorted = [...recommendations];

    switch (value) {
      case "price-low":
        sorted.sort((a, b) => a.product.price - b.product.price);
        break;
      case "price-high":
        sorted.sort((a, b) => b.product.price - a.product.price);
        break;
      case "relevance":
      default:
        sorted.sort((a, b) => b.score - a.score);
        break;
    }

    setFilteredRecommendations(sorted);
  };

  // Handle save results
  const handleSaveResults = () => {
    // In a real app, this would save to user's profile or send via email
    toast.success(
      "Your skin analysis results have been saved to your profile!"
    );
  };

  // Handle share results
  const handleShareResults = () => {
    // In a real app, this would generate a shareable link
    navigator.clipboard.writeText(
      `${window.location.origin}/skin-quiz/results?id=${analysisId}`
    );
    toast.success("Link copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Spin size="large" />
        <p className="mt-4">Loading your personalized recommendations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          action={
            <Button onClick={() => router.push("/skin-quiz")} type="primary">
              Retake Quiz
            </Button>
          }
        />
      </div>
    );
  }

  if (!skinAnalysis || filteredRecommendations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Empty
          description="No recommendations found. Your skin profile is unique!"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
        <Button
          type="primary"
          onClick={() => router.push("/skin-quiz")}
          className="mt-4"
        >
          Retake Quiz
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <Title level={2}>Your Personalized Skincare Recommendations</Title>
        <Paragraph>
          Based on your skin profile, we've selected these products to address
          your specific needs.
        </Paragraph>
      </div>

      {/* Skin Profile Summary */}
      <Card className="mb-8">
        <Title level={4}>Your Skin Profile</Title>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Text strong>Skin Type:</Text>{" "}
            <Tag color="blue">{skinAnalysis.skinType}</Tag>
          </div>
          <div>
            <Text strong>Skin Concerns:</Text>{" "}
            {skinAnalysis.skinConcerns.map((concern: string) => (
              <Tag key={concern} color="green">
                {concern}
              </Tag>
            ))}
          </div>
        </div>
      </Card>

      {/* Sorting and Filtering Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <div className="flex items-center mb-4 sm:mb-0">
          <Filter className="mr-2 h-5 w-5" />
          <Text strong>Sort by:</Text>
          <Select
            defaultValue="relevance"
            style={{ width: 150, marginLeft: 8 }}
            onChange={handleSortChange}
            value={sortOption}
          >
            <Option value="relevance">Best Match</Option>
            <Option value="price-low">Price: Low to High</Option>
            <Option value="price-high">Price: High to Low</Option>
          </Select>
        </div>

        <div className="flex space-x-2">
          <Button
            icon={<Save className="h-4 w-4 mr-1" />}
            onClick={handleSaveResults}
          >
            Save Results
          </Button>
          <Button
            icon={<Share2 className="h-4 w-4 mr-1" />}
            onClick={handleShareResults}
          >
            Share
          </Button>
        </div>
      </div>

      {/* Product Recommendations */}
      <Row gutter={[16, 16]}>
        {filteredRecommendations.map((item) => (
          <Col xs={24} sm={12} md={8} key={item.product._id}>
            <Card
              hoverable
              className="h-full flex flex-col"
              cover={
                <div className="h-48 relative">
                  <img
                    alt={item.product.name}
                    className="w-full h-48 object-cover"
                    src={item.product.image}
                  />
                </div>
              }
              actions={[
                <Button
                  key="view"
                  type="link"
                  onClick={() => router.push(`/products/${item.product._id}`)}
                >
                  View Details
                </Button>,
                <Button
                  key="add"
                  type="primary"
                  icon={<ShoppingCart className="h-4 w-4 mr-1" />}
                  onClick={() =>
                    toast.success(`${item.product.name} added to cart!`)
                  }
                >
                  Add to Cart
                </Button>,
              ]}
            >
              <div className="p-4 bg-background/50 flex-grow flex flex-col justify-between">
                <div>
                  <Title level={5}>{item.product.name}</Title>
                  <Paragraph className="text-lg font-semibold">
                    Rs.{item.product.price.toFixed(2)}
                  </Paragraph>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button
                    icon={<Rate className="h-4 w-4 mr-1" />}
                    disabled
                    defaultValue={Math.ceil(item.score / 20)}
                  />
                  <Tag color="blue" className="ml-2">
                    {item.score}% Match
                  </Tag>
                </div>
              </div>

              <Paragraph ellipsis={{ rows: 2 }}>
                {item.product.description}
              </Paragraph>

              <Divider className="my-2" />

              <div>
                <Text strong>Why it's a match:</Text>
                <ul className="list-disc pl-5 mt-1">
                  {item.matchReasons.map((reason, index) => (
                    <li key={index}>
                      <Text>{reason}</Text>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Retake Quiz Button */}
      <div className="text-center mt-12">
        <Button
          type="default"
          size="large"
          onClick={() => router.push("/skin-quiz")}
        >
          Retake Quiz
        </Button>
      </div>
    </div>
  );
}
