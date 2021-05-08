package com.uniovi.tests;
//Paquetes Java
import java.util.List;
import java.util.Random;

//Paquetes JUnit 
import org.junit.*;
import org.junit.runners.MethodSorters;

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
//Paquetes Selenium 
import org.openqa.selenium.*;
import org.openqa.selenium.firefox.*;
//Paquetes Utilidades de Testing Propias
import com.uniovi.tests.util.SeleniumUtils;
//Paquetes con los Page Object
import com.uniovi.tests.pageobjects.*;


//Ordenamos las pruebas por el nombre del mÃ©todo
@FixMethodOrder(MethodSorters.NAME_ASCENDING) 
public class SdiEntrega2Tests {
	//En Windows (Debe ser la versiÃ³n 65.0.1 y desactivar las actualizacioens automÃ¡ticas)):
	static String PathFirefox65 = "C:\\Program Files\\Mozilla Firefox\\firefox.exe";
	static String Geckdriver024 = "C:\\geckodriver024win64.exe";
	//En MACOSX (Debe ser la versiÃ³n 65.0.1 y desactivar las actualizacioens automÃ¡ticas):
	//static String PathFirefox65 = "/Applications/Firefox 2.app/Contents/MacOS/firefox-bin";
	//static String PathFirefox64 = "/Applications/Firefox.app/Contents/MacOS/firefox-bin";
	//static String Geckdriver024 = "/Users/delacal/Documents/SDI1718/firefox/geckodriver024mac";
	//static String Geckdriver022 = "/Users/delacal/Documents/SDI1718/firefox/geckodriver023mac";
	//ComÃºn a Windows y a MACOSX
	static WebDriver driver = getDriver(PathFirefox65, Geckdriver024); 
	static String URL = "https://localhost:8081";
	

	public static WebDriver getDriver(String PathFirefox, String Geckdriver) {
		System.setProperty("webdriver.firefox.bin", PathFirefox);
		System.setProperty("webdriver.gecko.driver", Geckdriver);
		WebDriver driver = new FirefoxDriver();
		return driver;
	}


	@Before
	public void setUp(){
		driver.navigate().to(URL);
	}
	@After
	public void tearDown(){
		driver.manage().deleteAllCookies();
	}
	@BeforeClass 
	static public void begin() {
		//COnfiguramos las pruebas.
		//Fijamos el timeout en cada opciÃ³n de carga de una vista. 2 segundos.
		PO_View.setTimeout(3);

	}
	@AfterClass
	static public void end() {
		//Cerramos el navegador al finalizar las pruebas
		driver.quit();
	}

	//PR01. Registro de usuario con datos validos/
	@Test
	public void PR01() {
		String email = "candela" + Math.random()*6 +"@gmail.com";
		PO_PrivateView.signup(driver, email, "Candela", "Bobes", "12345", "12345");
		assertNotNull(PO_View.checkElement(driver, "text", "Lista De Ofertas Destacadas"));	
		PO_PrivateView.logout(driver);	
		PO_View.checkElement(driver, "text", "Identificación de usuario");
			
	}

	//PR02. Registro de Usuario con datos inválidos (email, nombre y apellidos vacíos)./
	@Test
	public void PR02() {
		PO_PrivateView.signup(driver, "", "", "", "12345", "12345");
		assertNotNull(PO_View.checkElement(driver, "id", "signup"));					
	}

	//PR03. Registro de Usuario con datos inválidos (repetición de contraseña inválida) /
	@Test
	public void PR03() {
		PO_PrivateView.signup(driver, "candelabj00@gmail.com", "Candela", "Bobes", "12345", "12345865736");
		assertNotNull(PO_View.checkElement(driver, "id", "signup"));		
		assertNotNull(PO_View.checkElement(driver, "text", "La contraseña no coincide"));
	}
	
	//PR04. Registro de Usuario con datos inválidos (email existente). /
	@Test
	public void PR04() {
		PO_PrivateView.signup(driver, "candela@gmail.com", "Candela", "Bobes", "12345", "12345");
		assertNotNull(PO_View.checkElement(driver, "id", "signup"));		
		assertNotNull(PO_View.checkElement(driver, "text", "Ya existe un usuario con ese email."));			
	}
	
	//PR05. Inicio de sesión con datos válidos. /
	@Test
	public void PR05() {
		PO_PrivateView.login(driver, "candela@gmail.com", "12345");		
		assertNotNull(PO_View.checkElement(driver, "text", "Lista De Ofertas Destacadas"));	
		PO_PrivateView.logout(driver);	
		PO_View.checkElement(driver, "text", "Identificación de usuario");
	}
	
	//PR06. Inicio de sesión con datos inválidos (email existente, pero contraseña incorrecta). /
	@Test
	public void PR06() {
		assertTrue("PR06 sin hacer", false);			
	}
	
	//PR07. SInicio de sesión con datos inválidos (campo email o contraseña vacíos). /
	@Test
	public void PR07() {
		assertTrue("PR07 sin hacer", false);			
	}	
	
	//PR08. Inicio de sesión con datos inválidos (email no existente en la aplicación) /
	@Test
	public void PR08() {
		assertTrue("PR08 sin hacer", false);			
	}	
	
	//PR09. Sin hacer /
	@Test
	public void PR09() {
		assertTrue("PR09 sin hacer", false);			
	}	
	//PR10. Sin hacer /
	@Test
	public void PR10() {
		assertTrue("PR10 sin hacer", false);			
	}	
	
	//PR11. Sin hacer /
	@Test
	public void PR11() {
		assertTrue("PR11 sin hacer", false);			
	}	
	
	//PR12. Sin hacer /
	@Test
	public void PR12() {
		assertTrue("PR12 sin hacer", false);			
	}	
	
	//PR13. Sin hacer /
	@Test
	public void PR13() {
		assertTrue("PR13 sin hacer", false);			
	}	
	
	//PR14. Sin hacer /
	@Test
	public void PR14() {
		assertTrue("PR14 sin hacer", false);			
	}	
	
	//PR15. Sin hacer /
	@Test
	public void PR15() {
		assertTrue("PR15 sin hacer", false);			
	}	
	
	//PR16. Sin hacer /
	@Test
	public void PR16() {
		assertTrue("PR16 sin hacer", false);			
	}	
	
	//PR017. Sin hacer /
	@Test
	public void PR17() {
		assertTrue("PR17 sin hacer", false);			
	}	
	
	//PR18. Sin hacer /
	@Test
	public void PR18() {
		assertTrue("PR18 sin hacer", false);			
	}	
	
	//PR19. Sin hacer /
	@Test
	public void PR19() {
		assertTrue("PR19 sin hacer", false);			
	}	
	
	//P20. Sin hacer /
	@Test
	public void PR20() {
		assertTrue("PR20 sin hacer", false);			
	}	
	
	//PR21. Sin hacer /
	@Test
	public void PR21() {
		assertTrue("PR21 sin hacer", false);			
	}	
	
	//PR22. Sin hacer /
	@Test
	public void PR22() {
		assertTrue("PR22 sin hacer", false);			
	}	
	
	//PR23. Sin hacer /
	@Test
	public void PR23() {
		assertTrue("PR23 sin hacer", false);			
	}	
	
	//PR24. Sin hacer /
	@Test
	public void PR24() {
		assertTrue("PR24 sin hacer", false);			
	}	
	//PR25. Sin hacer /
	@Test
	public void PR25() {
		assertTrue("PR25 sin hacer", false);			
	}	
	
	//PR26. Sin hacer /
	@Test
	public void PR26() {
		assertTrue("PR26 sin hacer", false);			
	}	
	
	//PR27. Sin hacer /
	@Test
	public void PR27() {
		assertTrue("PR27 sin hacer", false);			
	}	
	
	//PR029. Sin hacer /
	@Test
	public void PR29() {
		assertTrue("PR29 sin hacer", false);			
	}

	//PR030. Sin hacer /
	@Test
	public void PR30() {
		assertTrue("PR30 sin hacer", false);			
	}
	
	//PR031. Sin hacer /
	@Test
	public void PR31() {
		assertTrue("PR31 sin hacer", false);			
	}
	
		
}

