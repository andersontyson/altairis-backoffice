# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj files and restore dependencies
COPY ["Altairis.Api/Altairis.Api.csproj", "Altairis.Api/"]
COPY ["Altairis.Application/Altairis.Application.csproj", "Altairis.Application/"]
COPY ["Altairis.Domain/Altairis.Domain.csproj", "Altairis.Domain/"]
COPY ["Altairis.Infrastructure/Altairis.Infrastructure.csproj", "Altairis.Infrastructure/"]
RUN dotnet restore "Altairis.Api/Altairis.Api.csproj"

# Copy the rest of the code and build
COPY . .
WORKDIR "/src/Altairis.Api"
RUN dotnet build "Altairis.Api.csproj" -c Release -o /app/build

# Stage 2: Publish
FROM build AS publish
RUN dotnet publish "Altairis.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 3: Final image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Altairis.Api.dll"]
