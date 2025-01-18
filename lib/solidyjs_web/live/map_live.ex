defmodule SolidyjsWeb.MapLive do
  use SolidyjsWeb, :live_view
  use Phoenix.Component
  alias SolidyjsWeb.Menu
  alias Phoenix.LiveView.AsyncResult
  alias Phoenix.PubSub
  # import SolidyjsWeb.CoreComponents, only: [button: 1]

  require Logger

  @impl true
  def render(assigns) do
    ~H"""
    <div>
      <Menu.display />
      <div id="map" phx-hook="MapHook" phx-update="ignore" style="height: 300px"></div>
      <div id="select_form" phx-hook="FormHook" phx-update="ignore"></div>
    </div>
    """
  end

  @impl true
  def mount(_params, session, socket) do
    %{"user_id" => user_id} = session

    fetched_airports? =
      case :ets.lookup(:app_state, :fetched_airports) do
        [{:fetched, ^user_id}] -> true
        _ -> false
      end

    if connected?(socket) do
      # :ok = PubSub.subscribe(:pubsub, "download_progress")
      :ok = PubSub.subscribe(:pubsub, "new_airport")
      :ok = PubSub.subscribe(:pubsub, "remove_airport")
      :ok = PubSub.subscribe(:pubsub, "do_fly")
    end

    {:ok,
     socket
     |> assign(:user_id, user_id)
     |> assign(:fetched_airports?, fetched_airports?)
     |> push_event("user", %{user_id: user_id})}
  end

  @impl true
  def handle_params(_, uri, socket) do
    case URI.parse(uri).path do
      "/map" ->
        if socket.assigns.fetched_airports? do
          {:noreply, socket}
        else
          {:noreply,
           socket
           |> assign(:airports, AsyncResult.loading())
           |> start_async(
             :fetch_airports,
             &SqliteHandler.municipalities/0
           )}
        end
    end
  end

  # airport list setup on mount ---------->
  @impl true
  def handle_async(:fetch_airports, {:ok, fetched_airports}, socket) do
    %{airports: airports} = socket.assigns
    :ets.insert(:app_state, {:fetched, socket.assigns.user_id})

    {:noreply,
     socket
     |> assign(:airports, AsyncResult.ok(airports, fetched_airports))
     |> push_event("airports", %{airports: fetched_airports})
     |> assign(:airports, %{})}
  end

  @impl true
  def handle_async(:airports, {:exit, reason}, socket) do
    %{airports: airports} = socket.assigns

    {:noreply,
     socket
     |> assign(:airports, AsyncResult.failed(airports, {:exit, reason}))}
  end

  # <---------- airport list

  # Clients events callbacks: broadcast to all subscribed clients
  @impl true
  def handle_event("fly", %{"userID" => userID} = payload, socket) do
    :ok =
      PubSub.broadcast(
        :pubsub,
        "do_fly",
        Map.merge(payload, %{"action" => "do_fly", "from" => userID})
      )

    {:noreply, socket}
  end

  def handle_event("add", new_airport, socket) do
    :ok =
      PubSub.broadcast(
        :pubsub,
        "new_airport",
        Map.merge(new_airport, %{"action" => "added_airport"})
      )

    {:noreply, socket}
  end

  def handle_event("delete", old_airport, socket) do
    :ok =
      PubSub.broadcast(
        :pubsub,
        "remove_airport",
        Map.merge(old_airport, %{"action" => "deleted_airport"})
      )

    {:noreply, socket}
  end

  # PubSub callback: pushes response to other clients
  @impl true
  def handle_info(%{"action" => action} = payload, socket) do
    user_id = Integer.to_string(socket.assigns.user_id)
    from = Map.get(payload, "userID")

    case user_id != from do
      true ->
        Logger.info(inspect({action, payload}))
        {:noreply, push_event(socket, action, payload)}

      false ->
        {:noreply, socket}
    end
  end
end
