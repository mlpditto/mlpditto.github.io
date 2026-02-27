import os
import urllib.parse
import logging
import shutil
from datetime import datetime
from playwright.sync_api import sync_playwright

# Setup Logging
LOG_FILE = "download.log"
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(LOG_FILE, encoding="utf-8"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

USERNAME = "001"
PASSWORD = "JoeyBM"

YEAR_FROM = "2026"
MONTH_FROM = "2"
DAY_FROM = "26"
CUSTOMER_FILTER = "บริษัท ชีวีบริรักษ์"

YEAR_TO = "2026"
MONTH_TO = "2"
DAY_TO = "26"

BASE = "http://mlp001.trueddns.com:34610"
LOGIN_URL = f"{BASE}/WebFront/Home/Login.aspx"
LIST_URL = f"{BASE}/WebFront/ProductSales/WholeSale_List.aspx"

SAVE_FOLDER = "invoices"
os.makedirs(SAVE_FOLDER, exist_ok=True)


def collect_current_page(page, context, save_folder, target_invoices=None):
    # Get rows specifically from the main data table that have Order ID links
    rows = page.locator("table tr:has(a[href*='WholeSale.aspx'], a[href*='Pos_Retail.aspx'])").all()
    
    logger.info(f"Checking {len(rows)} potential invoice rows...")

    pending_targets = set(target_invoices) if target_invoices is not None else None

    for row in rows:
        if pending_targets is not None and len(pending_targets) == 0:
            logger.info("All target invoices have been processed. Stopping early.")
            break
            
        cols = row.locator("td").all()
        if len(cols) < 2:
            continue

        order_no = cols[0].inner_text().strip().split('\n')[0]
        order_link_el = cols[0].locator("a").first
        
        tax_inv_no = ""
        if len(cols) > 2:
            tax_inv_no = cols[2].inner_text().strip().split('\n')[0]
        
        if "หน้าหลัก" in order_no or not order_no or "เลขที่" in order_no:
            continue
            
        if not ("ORW-" in order_no):
            continue

        target_name = tax_inv_no if tax_inv_no and "INV-" in tax_inv_no else order_no
        
        if target_invoices is not None and target_name not in target_invoices and order_no not in target_invoices:
            continue
            
        filename = os.path.join(save_folder, f"{target_name}.pdf")
        
        if os.path.exists(filename):
            logger.info(f"Skipping (Already exists): {target_name}")
            if pending_targets is not None:
                pending_targets.discard(target_name)
                pending_targets.discard(order_no)
            continue

        if len(cols) >= 4:
            customer_name = cols[3].inner_text().strip()
            if CUSTOMER_FILTER not in customer_name:
                continue
        else:
            continue

        logger.info(f">>> Processing: {target_name} for {CUSTOMER_FILTER}")

        try:
            if order_link_el.count() > 0:
                detail_url = urllib.parse.urljoin(page.url, order_link_el.get_attribute("href"))
                detail_page = context.new_page()
                detail_page.goto(detail_url)
                
                detail_page.wait_for_load_state("networkidle")
                detail_page.wait_for_timeout(3000) 

                try:
                    print_enable_checkbox = detail_page.locator("input[type='checkbox']:near(:text('พิมพ์เอกสาร'))").first
                    if print_enable_checkbox.count() > 0 and not print_enable_checkbox.is_checked():
                        logger.info("Enabling 'พิมพ์เอกสาร' checkbox...")
                        print_enable_checkbox.check()
                        detail_page.wait_for_timeout(1000)
                except Exception: pass

                logger.info(f"Searching for print button for: 1. ต้นฉบับใบกำกับภาษี")
                print_btn = detail_page.locator(f"xpath=//*[contains(text(), '1. ต้นฉบับใบกำกับภาษี')]/following::input[@value='พิมพ์'][1] | //*[contains(text(), '1. ต้นฉบับใบกำกับภาษี')]/following::button[contains(., 'พิมพ์')][1]").first
                
                if print_btn.count() == 0:
                    print_btn = detail_page.locator("//tr[td[contains(., '1. ต้นฉบับใบกำกับภาษี')]]//input[@value='พิมพ์']").first

                if print_btn.count() > 0:
                    logger.info(f"Found print button, triggering PDF preview...")
                    print_btn.evaluate("el => el.click()")
                    
                    try:
                        with context.expect_page(timeout=1000) as new_page_info:
                            pass
                        pdf_source = new_page_info.value
                        logger.info("Captured PDF via new tab.")
                    except:
                        logger.info("No new tab detected, looking for modal/iframe overlay...")
                        detail_page.wait_for_timeout(2000) 
                        
                        modal_iframe = detail_page.locator("iframe:visible, div[class*='modal']:visible, div[id*='dialog']:visible").first
                        
                        if modal_iframe.count() > 0:
                            logger.info("Found modal/iframe overlay, generating PDF from current view...")
                            iframe_src = modal_iframe.get_attribute("src")
                            if iframe_src:
                                logger.info(f"Directing to iframe source: {iframe_src}")
                                pdf_source = context.new_page()
                                pdf_source.goto(urllib.parse.urljoin(detail_page.url, iframe_src))
                                pdf_source.wait_for_load_state("networkidle")
                                pdf_source.wait_for_timeout(1000)
                            else:
                                pdf_source = detail_page
                        else:
                            with context.expect_page(timeout=2000) as new_page_info:
                                pass
                            pdf_source = new_page_info.value
                            logger.info("Captured PDF via delayed new tab.")
                    pdf_source.wait_for_timeout(2000)
                    
                    logger.info("Using direct render approach (Native DL skipped for speed)...")
                    try:
                        # Safely hide the toolbar without hiding the report table
                        pdf_source.evaluate("""() => {
                            // 1. Attempt to find and hide the SSRS toolbar by ID
                            document.querySelectorAll('[id$="_ctl05"]').forEach(el => {
                                if(el.offsetHeight < 150) {
                                    el.style.setProperty('display', 'none', 'important');
                                }
                            });

                            // 2. Heuristic: Hide small rows/divs that contain navigation/export icons
                            const navIcons = document.querySelectorAll('img[alt*="Export"], img[alt*="Print"], img[src*="Export"], img[src*="Print"]');
                            navIcons.forEach(icon => {
                                // Hide the nearest table row or div that is relatively short
                                let tr = icon.closest('tr');
                                if (tr && tr.offsetHeight > 0 && tr.offsetHeight < 100) {
                                    tr.style.setProperty('display', 'none', 'important');
                                } else {
                                    let div = icon.closest('div');
                                    if (div && div.offsetHeight > 0 && div.offsetHeight < 100) {
                                        div.style.setProperty('display', 'none', 'important');
                                    }
                                }
                            });

                            // 3. Also hide any explicit toolbar classes
                            const hideSelectors = [
                                '[id*="Toolbar"]', '[class*="toolbar"]', '.sti-toolbar', 
                                '[id*="Menu"]', '.sti-menu-container', '.sti-window'
                            ];
                            hideSelectors.forEach(sel => {
                                document.querySelectorAll(sel).forEach(el => {
                                    if(el.offsetHeight < 150) { // Safety check to prevent hiding entire page
                                        el.style.setProperty('display', 'none', 'important');
                                    }
                                });
                            });

                            // 4. Critical for SSRS: Make the report container overflow visible so the whole thing prints!
                            const reportPanels = document.querySelectorAll('[id$="_ctl09"], [id*="ReportPanel"], .report-content');
                            reportPanels.forEach(panel => {
                                panel.style.setProperty('overflow', 'visible', 'important');
                                panel.style.setProperty('height', 'auto', 'important');
                            });
                            
                            // Ensure html/body can also scroll naturally
                            document.documentElement.style.setProperty('overflow', 'visible', 'important');
                            document.documentElement.style.setProperty('height', 'auto', 'important');
                            document.body.style.setProperty('overflow', 'visible', 'important');
                            document.body.style.setProperty('height', 'auto', 'important');
                            document.body.style.backgroundColor = 'white';
                            
                        }""")
                    except Exception as script_e: 
                        logger.warning(f"JS evaluation for hide failed: {script_e}")
                    
                    pdf_source.wait_for_timeout(1000) # wait for CSS to take effect
                    pdf_source.pdf(path=filename, format="A4", print_background=True, margin={"top": "0mm", "bottom": "0mm", "left": "0mm", "right": "0mm"})
                    logger.info(f"Saved PDF via render (toolbar hidden): {target_name}.pdf")
                    
                    if pending_targets is not None:
                        pending_targets.discard(target_name)
                        pending_targets.discard(order_no)

                    
                    if pdf_source != detail_page:
                        pdf_source.close()
                    
                    detail_page.close()
                else:
                    msg = f"Could not find print button on detail page for {target_name}"
                    logger.error(msg)
                    detail_page.close()
                    raise Exception(msg)
            else:
                msg = f"No Order link found for {target_name}"
                logger.error(msg)
                raise Exception(msg)

        except Exception as e:
            logger.error(f"Failed to process {target_name}: {str(e)}")
            raise e


def zip_invoices(folder, zip_name):
    logger.info(f"Zipping invoices into {zip_name}...")
    try:
        shutil.make_archive(zip_name.replace(".zip", ""), 'zip', folder)
        logger.info("Zipping complete.")
    except Exception as e:
        logger.error(f"Zipping failed: {str(e)}")


def main(target_invoices=None, custom_path=""):
    _save_folder = custom_path.strip() if custom_path and custom_path.strip() != "" else SAVE_FOLDER
    os.makedirs(_save_folder, exist_ok=True)
    
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True, 
            args=[
                "--disable-popup-blocking", 
                "--disable-extensions",
                "--no-sandbox",
                "--disable-setuid-sandbox"
            ]
        )
        context = browser.new_context(accept_downloads=True)
        page = context.new_page()

        # LOGIN
        page.goto(LOGIN_URL)
        page.wait_for_selector("input[type='password']")

        page.locator("input[type='text']").first.fill(USERNAME)
        page.locator("input[type='password']").first.fill(PASSWORD)

        with page.expect_navigation():
            page.locator("input[type='password']").press("Enter")

        print("LOGIN SUCCESS")

        # OPEN LIST
        page.goto(LIST_URL)
        page.wait_for_load_state("networkidle")

        try:
            full_tax_radio = page.locator("input[type='radio']:near(:text('ภาษีแบบเต็ม'))").first
            if full_tax_radio.count() > 0:
                full_tax_radio.click()
                logger.info("Selected 'ภาษีแบบเต็ม' mode.")
        except Exception as e:
            logger.warning(f"Could not select full tax mode: {str(e)}")

        try:
            page_size_select = page.locator("select:near(:text('รายการ/หน้า'))").first
            if page_size_select.count() > 0:
                try:
                    page_size_select.select_option(label="ทั้งหมด")
                except:
                    options = page_size_select.locator("option").all()
                    if options:
                        page_size_select.select_option(options[-1].get_attribute("value"))
                
                logger.info("Set rows per page to 'ทั้งหมด'")
                page.wait_for_timeout(2000)
        except Exception as e:
            logger.warning(f"Could not set rows per page: {str(e)}")

        print("Clicking search...")

        with page.expect_navigation():
            page.get_by_text("ดูข้อมูล", exact=False).click()

        print("Search complete")

        # ---------- COLLECTION ----------
        collect_current_page(page, context, _save_folder, target_invoices)

        print("ALL DONE")
        browser.close()

    if custom_path and custom_path.strip() != "":
        # Do not zip if a custom save path is provided directly to the local machine
        return None

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    zip_filename = f"invoices_backup_{timestamp}.zip"
    zip_invoices(_save_folder, zip_filename)
    
    # Return the folder or zip
    return os.path.abspath(zip_filename)


if __name__ == "__main__":
    main()