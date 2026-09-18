CREATE OR REPLACE FUNCTION private.is_guest_order(_order_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.orders WHERE id = _order_id AND user_id IS NULL)
$$;

REVOKE EXECUTE ON FUNCTION private.is_guest_order(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.is_guest_order(uuid) TO anon, authenticated, service_role;

DROP POLICY IF EXISTS "Guests add order items" ON public.order_items;
CREATE POLICY "Guests add order items"
ON public.order_items
FOR INSERT
TO anon
WITH CHECK (private.is_guest_order(order_id));