CREATE INDEX "purchase_vehicleId_idx" ON "purchase" USING btree ("vehicle_id");--> statement-breakpoint
CREATE INDEX "purchase_userId_idx" ON "purchase" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "purchase_createdAt_idx" ON "purchase" USING btree ("created_at");