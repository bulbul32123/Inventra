"use client";
import type React from "react";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSettings, updateSettings } from "@/lib/actions/settings.actions";
import { toast } from "sonner";
import { Loader2, Store, Receipt, Tag, Settings2 } from "lucide-react";
import useSWR from "swr";

export function SettingsForm() {
  const [isLoading, setIsLoading] = useState(false);

  const { data, mutate } = useSWR("settings", getSettings);
  const settings = data?.data;

  const [formData, setFormData] = useState({
    storeName: "",
    storeAddress: "",
    storePhone: "",
    storeEmail: "",
    currency: "USD",
    currencySymbol: "$",
    invoicePrefix: "INV",
    barcodeFormat: "CODE128" as "EAN13" | "CODE128" | "CODE39",
    lowStockThreshold: 10,
    enableLoyalty: false,
    loyaltyPointsPerCurrency: 1,
    receiptFooter: "",
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        storeName: settings.storeName || "",
        storeAddress: settings.storeAddress || "",
        storePhone: settings.storePhone || "",
        storeEmail: settings.storeEmail || "",
        currency: settings.currency || "USD",
        currencySymbol: settings.currencySymbol || "$",
        invoicePrefix: settings.invoicePrefix || "INV",
        barcodeFormat: settings.barcodeFormat || "CODE128",
        lowStockThreshold: settings.lowStockThreshold || 10,
        enableLoyalty: settings.enableLoyalty || false,
        loyaltyPointsPerCurrency: settings.loyaltyPointsPerCurrency || 1,
        receiptFooter: settings.receiptFooter || "",
      });
    }
  }, [settings]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    const result = await updateSettings(formData);

    if (result.success) {
      toast.success("Settings saved successfully");
      mutate();
    } else {
      toast.error(result.error || "Failed to save settings");
    }

    setIsLoading(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Configure your store and system preferences
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="store" className="space-y-6">
          <TabsList className="bg-primary/40">
            <TabsTrigger value="store" className="gap-2 cursor-pointer">
              <Store className="h-4 w-4" />
              Store
            </TabsTrigger>
            <TabsTrigger value="invoice" className="gap-2 cursor-pointer">
              <Receipt className="h-4 w-4" />
              Invoice
            </TabsTrigger>
            <TabsTrigger value="inventory" className="gap-2 cursor-pointer">
              <Tag className="h-4 w-4" />
              Inventory
            </TabsTrigger>
            <TabsTrigger value="advanced" className="gap-2 cursor-pointer">
              <Settings2 className="h-4 w-4" />
              Advanced
            </TabsTrigger>
          </TabsList>

          <TabsContent value="store">
            <Card>
              <CardHeader>
                <CardTitle>Store Information</CardTitle>
                <CardDescription>
                  Basic information about your business
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="storeName">Store Name</Label>
                  <Input
                    id="storeName"
                    value={formData.storeName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        storeName: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storeAddress">Address</Label>
                  <Textarea
                    id="storeAddress"
                    value={formData.storeAddress}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        storeAddress: e.target.value,
                      }))
                    }
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="storePhone">Phone</Label>
                    <Input
                      id="storePhone"
                      value={formData.storePhone}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          storePhone: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="storeEmail">Email</Label>
                    <Input
                      id="storeEmail"
                      type="email"
                      value={formData.storeEmail}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          storeEmail: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={formData.currency}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, currency: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                        <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                        <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currencySymbol">Currency Symbol</Label>
                    <Input
                      id="currencySymbol"
                      value={formData.currencySymbol}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          currencySymbol: e.target.value,
                        }))
                      }
                      maxLength={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoice">
            <Card>
              <CardHeader>
                <CardTitle>Invoice Settings</CardTitle>
                <CardDescription>
                  Customize your invoices and receipts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="invoicePrefix">Invoice Prefix</Label>
                  <Input
                    id="invoicePrefix"
                    value={formData.invoicePrefix}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        invoicePrefix: e.target.value.toUpperCase(),
                      }))
                    }
                    maxLength={5}
                  />
                  <p className="text-xs text-muted-foreground">
                    Example: {formData.invoicePrefix}-241215-000001
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="receiptFooter">Receipt Footer Message</Label>
                  <Textarea
                    id="receiptFooter"
                    value={formData.receiptFooter}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        receiptFooter: e.target.value,
                      }))
                    }
                    placeholder="Thank you for your purchase!"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Settings</CardTitle>
                <CardDescription>Stock management preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                  <Input
                    id="lowStockThreshold"
                    type="number"
                    min="0"
                    value={formData.lowStockThreshold}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        lowStockThreshold: Number(e.target.value),
                      }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Default reorder level for new products
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="barcodeFormat">Barcode Format</Label>
                  <Select
                    value={formData.barcodeFormat}
                    onValueChange={(value: "EAN13" | "CODE128" | "CODE39") =>
                      setFormData((prev) => ({ ...prev, barcodeFormat: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CODE128">
                        CODE128 (Recommended)
                      </SelectItem>
                      <SelectItem value="EAN13">EAN-13</SelectItem>
                      <SelectItem value="CODE39">CODE39</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced">
            <Card>
              <CardHeader>
                <CardTitle>Loyalty Program</CardTitle>
                <CardDescription>Customer loyalty settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Loyalty Points</Label>
                    <p className="text-xs text-muted-foreground">
                      Award points to customers for purchases
                    </p>
                  </div>
                  <Switch
                    checked={formData.enableLoyalty}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        enableLoyalty: checked,
                      }))
                    }
                  />
                </div>

                {formData.enableLoyalty && (
                  <div className="space-y-2">
                    <Label htmlFor="loyaltyPoints">
                      Points per {formData.currencySymbol}1 spent
                    </Label>
                    <Input
                      id="loyaltyPoints"
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.loyaltyPointsPerCurrency}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          loyaltyPointsPerCurrency: Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end mt-6">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
