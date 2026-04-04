$ErrorActionPreference = "Stop"
$base = "http://localhost:3000"
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$results = @()

function Add-Result {
  param([string]$name, [string]$status, [string]$detail)
  $script:results += [pscustomobject]@{ step = $name; status = $status; detail = $detail }
}

try {
  $h = Invoke-WebRequest -Uri "http://127.0.0.1:55000/api/health" -UseBasicParsing -TimeoutSec 10
  Add-Result "API health" "PASS" $h.Content
} catch {
  Add-Result "API health" "FAIL" $_.Exception.Message
}

try {
  $loginBody = '{"email":"owner@moqawalat.sa","password":"Admin@12345"}'
  $login = Invoke-WebRequest -Uri "$base/api/auth/login" -Method POST -ContentType "application/json" -Body $loginBody -WebSession $session -UseBasicParsing -TimeoutSec 15
  $loginObj = $login.Content | ConvertFrom-Json
  Add-Result "Admin login via web API" "PASS" $loginObj.user.email
} catch {
  Add-Result "Admin login via web API" "FAIL" $_.Exception.Message
}

$serviceId = $null
try {
  $serviceCreate = Invoke-WebRequest -Uri "$base/api/services" -Method POST -ContentType "application/x-www-form-urlencoded" -Body @{
    titleAr = "Service Integration Test"
    slug = "service-integration-test"
    shortDescAr = "Service integration short description for web and api"
    contentAr = "Service integration content to validate create update and delete flow"
    seoTitleAr = "Service SEO Test"
    seoDescriptionAr = "Service SEO Description"
    isPublished = "true"
    gallery = "[]"
    coverImage = "/images/logo-mark.png"
  } -WebSession $session -UseBasicParsing -TimeoutSec 20
  $serviceObj = $serviceCreate.Content | ConvertFrom-Json
  $serviceId = $serviceObj.id
  Add-Result "Create service" "PASS" "id=$serviceId"
} catch {
  Add-Result "Create service" "FAIL" $_.Exception.Message
}

try {
  $serviceList = Invoke-WebRequest -Uri "$base/api/services?q=integration&page=1&pageSize=10" -Method GET -WebSession $session -UseBasicParsing -TimeoutSec 15
  $serviceListObj = $serviceList.Content | ConvertFrom-Json
  $found = $serviceListObj.items | Where-Object { $_.slug -eq "service-integration-test" } | Select-Object -First 1
  if ($found) { Add-Result "List/search services" "PASS" "found" } else { Add-Result "List/search services" "FAIL" "not found" }
} catch {
  Add-Result "List/search services" "FAIL" $_.Exception.Message
}

try {
  if ($serviceId) {
    $serviceUpdate = Invoke-WebRequest -Uri "$base/api/services/$serviceId" -Method PUT -ContentType "application/x-www-form-urlencoded" -Body @{
      titleAr = "Service Integration Updated"
      slug = "service-integration-test"
      shortDescAr = "Updated short description for integration service"
      contentAr = "Updated content for integration service"
      seoTitleAr = "Service SEO Updated"
      seoDescriptionAr = "Service SEO Updated Description"
      isPublished = "false"
      gallery = "[]"
    } -WebSession $session -UseBasicParsing -TimeoutSec 20
    $serviceUpdateObj = $serviceUpdate.Content | ConvertFrom-Json
    if ($serviceUpdateObj.isPublished -eq $false) { Add-Result "Update service" "PASS" "isPublished=false" } else { Add-Result "Update service" "FAIL" "unexpected response" }
  } else {
    Add-Result "Update service" "FAIL" "missing id"
  }
} catch {
  Add-Result "Update service" "FAIL" $_.Exception.Message
}

try {
  if ($serviceId) {
    Invoke-WebRequest -Uri "$base/api/services/$serviceId" -Method DELETE -WebSession $session -UseBasicParsing -TimeoutSec 15 | Out-Null
    Add-Result "Delete service" "PASS" "deleted"
  } else {
    Add-Result "Delete service" "FAIL" "missing id"
  }
} catch {
  Add-Result "Delete service" "FAIL" $_.Exception.Message
}

$projectId = $null
try {
  $projectCreate = Invoke-WebRequest -Uri "$base/api/projects" -Method POST -ContentType "application/x-www-form-urlencoded" -Body @{
    titleAr = "Project Integration Test"
    slug = "project-integration-test"
    locationAr = "Dammam"
    categoryAr = "Testing"
    descriptionAr = "Project integration description to validate full CRUD behavior"
    seoTitleAr = "Project SEO Test"
    seoDescriptionAr = "Project SEO Description"
    isPublished = "true"
    gallery = "[]"
    coverImage = "/images/logo-full.png"
    beforeImage = "/images/placeholder-before.svg"
    afterImage = "/images/placeholder-after.svg"
  } -WebSession $session -UseBasicParsing -TimeoutSec 20
  $projectObj = $projectCreate.Content | ConvertFrom-Json
  $projectId = $projectObj.id
  Add-Result "Create project" "PASS" "id=$projectId"
} catch {
  Add-Result "Create project" "FAIL" $_.Exception.Message
}

try {
  $projectList = Invoke-WebRequest -Uri "$base/api/projects?q=integration&page=1&pageSize=10" -Method GET -WebSession $session -UseBasicParsing -TimeoutSec 15
  $projectListObj = $projectList.Content | ConvertFrom-Json
  $foundProject = $projectListObj.items | Where-Object { $_.slug -eq "project-integration-test" } | Select-Object -First 1
  if ($foundProject) { Add-Result "List/search projects" "PASS" "found" } else { Add-Result "List/search projects" "FAIL" "not found" }
} catch {
  Add-Result "List/search projects" "FAIL" $_.Exception.Message
}

try {
  if ($projectId) {
    $projectUpdate = Invoke-WebRequest -Uri "$base/api/projects/$projectId" -Method PUT -ContentType "application/x-www-form-urlencoded" -Body @{
      titleAr = "Project Integration Updated"
      slug = "project-integration-test"
      locationAr = "Khobar"
      categoryAr = "TestingUpdated"
      descriptionAr = "Updated project description for integration validation"
      seoTitleAr = "Project SEO Updated"
      seoDescriptionAr = "Project SEO Updated Description"
      isPublished = "false"
      gallery = "[]"
    } -WebSession $session -UseBasicParsing -TimeoutSec 20
    $projectUpdateObj = $projectUpdate.Content | ConvertFrom-Json
    if ($projectUpdateObj.isPublished -eq $false) { Add-Result "Update project" "PASS" "isPublished=false" } else { Add-Result "Update project" "FAIL" "unexpected response" }
  } else {
    Add-Result "Update project" "FAIL" "missing id"
  }
} catch {
  Add-Result "Update project" "FAIL" $_.Exception.Message
}

try {
  if ($projectId) {
    Invoke-WebRequest -Uri "$base/api/projects/$projectId" -Method DELETE -WebSession $session -UseBasicParsing -TimeoutSec 15 | Out-Null
    Add-Result "Delete project" "PASS" "deleted"
  } else {
    Add-Result "Delete project" "FAIL" "missing id"
  }
} catch {
  Add-Result "Delete project" "FAIL" $_.Exception.Message
}

$leadId = $null
try {
  $started = (Get-Date).AddSeconds(-5).ToString("o")
  $leadCreate = Invoke-WebRequest -Uri "$base/api/leads" -Method POST -ContentType "application/x-www-form-urlencoded" -Body @{
    fullName = "Integration Lead"
    phone = "0500000000"
    city = "Dammam"
    serviceType = "Painting"
    message = "Integration test lead message"
    website = ""
    formStartedAt = $started
    source = "website"
    pageUrl = "/"
  } -UseBasicParsing -TimeoutSec 20
  Add-Result "Create lead (public)" "PASS" $leadCreate.Content
} catch {
  Add-Result "Create lead (public)" "FAIL" $_.Exception.Message
}

try {
  $leads = Invoke-WebRequest -Uri "$base/api/leads?page=1&pageSize=20&q=Integration" -Method GET -WebSession $session -UseBasicParsing -TimeoutSec 20
  $leadsObj = $leads.Content | ConvertFrom-Json
  $matchLead = $leadsObj.items | Where-Object { $_.fullName -eq "Integration Lead" } | Select-Object -First 1
  if ($matchLead) {
    $leadId = $matchLead.id
    Add-Result "List leads (admin)" "PASS" "id=$leadId"
  } else {
    Add-Result "List leads (admin)" "FAIL" "not found"
  }
} catch {
  Add-Result "List leads (admin)" "FAIL" $_.Exception.Message
}

try {
  if ($leadId) {
    $leadPatchBody = '{"status":"CONTACTED","crmNotes":"Integration test note"}'
    $leadPatch = Invoke-WebRequest -Uri "$base/api/leads/$leadId" -Method PATCH -ContentType "application/json" -Body $leadPatchBody -WebSession $session -UseBasicParsing -TimeoutSec 20
    $leadPatchObj = $leadPatch.Content | ConvertFrom-Json
    if ($leadPatchObj.status -eq "CONTACTED") { Add-Result "Update lead status/notes" "PASS" "status CONTACTED" } else { Add-Result "Update lead status/notes" "FAIL" "unexpected response" }
  } else {
    Add-Result "Update lead status/notes" "FAIL" "missing id"
  }
} catch {
  Add-Result "Update lead status/notes" "FAIL" $_.Exception.Message
}

$results | ConvertTo-Json -Depth 5